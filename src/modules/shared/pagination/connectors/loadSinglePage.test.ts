import generateDeterministicCacheId from "../logic/generateDeterministicCacheId";
import decodeDeterministicCacheId from "../logic/decodeDeterministicCacheId";
import db from "../../../../knex";
import loadSinglePage from "./loadSinglePage";
import * as faker from "faker";

faker.seed(Date.now() + process.hrtime()[1]);

describe("loadSinglePage / paginator", () => {
  test("uses filter query correctly", async () => {
    const randomLeader = faker.random.number(1000);
    const teams = [
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_aa_${faker.company.companyName()}`
      },
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_zz_${faker.company.companyName()}`
      }
    ];
    await db("teams").insert(teams);
    const fetchPayload = {
      table: { name: "teams", uniqueColumn: "id" },
      where: { name_is: teams[0].name }
    };

    const results = await loadSinglePage(
      generateDeterministicCacheId(fetchPayload)
    );
    // {"items": [{"createdAt": 2018-08-02T15:32:07.345Z, "deletedAt": null, "id": "d91994fd-0bc1-4eac-b1d0-fc5bb4d12f88", "name": "a", "updatedAt": null}], "pageInfo": {"fromCache": false, "nextCursor": undefined, "totalCount": "1"}}
    expect(results.items.length).toBe(1);
    expect(results.items[0].name).toEqual(teams[0].name);
    expect(results.pageInfo.nextCursor).toBeUndefined();
    expect(results.pageInfo.fromCache).toBe(false);
    expect(results.pageInfo.totalCount).toBe("1");
  });

  test("uses limit / order asc correctly", async () => {
    const randomLeader = faker.random.number(1000);
    const teams = [
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_aa_${faker.company.companyName()}`
      },
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_zz_${faker.company.companyName()}`
      }
    ];
    await db("teams").insert(teams);
    const fetchPayload = {
      table: { name: "teams", uniqueColumn: "id" },
      limit: 1,
      where: { name_startswith: randomLeader },
      orderBy: [{ sort: "name", direction: "ASC" }]
    };

    const results = await loadSinglePage(
      generateDeterministicCacheId(fetchPayload)
    );
    expect(results.items.length).toBe(1);
    expect(results.items[0].name).toEqual(teams[0].name);
    expect(typeof results.pageInfo.nextCursor).toBe("string");

    const decodedNextCursor = decodeDeterministicCacheId(
      results.pageInfo.nextCursor
    );
    expect(decodedNextCursor).toEqual({
      orderBy: [
        { direction: "ASC", sort: "name" },
        { direction: "ASC", sort: "id" },
        { direction: "ASC", sort: "id" }
      ],
      values: [teams[1].name, teams[1].id, teams[1].id]
    });

    expect(results.pageInfo.fromCache).toBe(false);
    expect(results.pageInfo.totalCount).toBe("2");
  });

  test("uses limit / order DESC correctly", async () => {
    const randomLeader = faker.random.number(1000);
    const teams = [
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_aa_${faker.company.companyName()}`
      },
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_zz_${faker.company.companyName()}`
      }
    ];
    await db("teams").insert(teams);
    const fetchPayload = {
      table: { name: "teams", uniqueColumn: "id" },
      limit: 1,
      where: { name_startswith: randomLeader },
      orderBy: [{ sort: "name", direction: "DESC" }]
    };

    const results = await loadSinglePage(
      generateDeterministicCacheId(fetchPayload)
    );
    expect(results.items.length).toBe(1);
    expect(results.items[0].name).toEqual(teams[1].name);
    expect(typeof results.pageInfo.nextCursor).toBe("string");

    const decodedNextCursor = decodeDeterministicCacheId(
      results.pageInfo.nextCursor
    );
    expect(decodedNextCursor).toEqual({
      orderBy: [
        { direction: "DESC", sort: "name" },
        { direction: "ASC", sort: "id" },
        { direction: "ASC", sort: "id" }
      ],
      values: [teams[0].name, teams[0].id, teams[0].id]
    });

    expect(results.pageInfo.fromCache).toBe(false);
    expect(results.pageInfo.totalCount).toBe("2");
  });

  test("pagination works correctly", async () => {
    const randomLeader = faker.random.number(1000);
    const teams = [
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_aa_${faker.company.companyName()}`
      },
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_zz_${faker.company.companyName()}`
      }
    ];
    await db("teams").insert(teams);
    const fetchPayload = {
      table: { name: "teams", uniqueColumn: "id" },
      limit: 1,
      where: { name_startswith: randomLeader },
      orderBy: [{ sort: "name", direction: "ASC" }]
    };

    const results = await loadSinglePage(
      generateDeterministicCacheId(fetchPayload)
    );
    expect(results.items.length).toBe(1);
    expect(results.items[0].name).toEqual(teams[0].name);

    const fetchPayloadNextPage = {
      table: { name: "teams", uniqueColumn: "id" },
      after: results.pageInfo.nextCursor,
      limit: 1,
      where: { name_startswith: randomLeader },
      orderBy: [{ sort: "name", direction: "ASC" }]
    };

    const results2 = await loadSinglePage(
      generateDeterministicCacheId(fetchPayloadNextPage)
    );
    expect(results2.items.length).toBe(1);
    expect(results2.items[0].name).toEqual(teams[1].name);
  });

  test("uses caching/ttl correctly", async () => {
    const randomLeader = faker.random.number(1000);
    const teams = [
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_aa_${faker.company.companyName()}`
      },
      {
        id: faker.random.uuid(),
        name: `${randomLeader}_zz_${faker.company.companyName()}`
      }
    ];
    await db("teams").insert(teams);
    const fetchPayload = {
      table: { name: "teams", uniqueColumn: "id" },
      ttl: 120,
      where: { name_startswith: randomLeader }
    };

    const results = await loadSinglePage(
      generateDeterministicCacheId(fetchPayload)
    );
    expect(results.items.length).toBe(2); //
    expect(results.pageInfo.fromCache).toBe(false);
    expect(results.pageInfo.totalCount).toBe("2");

    const results2 = await loadSinglePage(
      generateDeterministicCacheId(fetchPayload)
    );
    expect(results2.items.length).toBe(2);
    expect(results2.pageInfo.fromCache).toBe(true);
    expect(results2.pageInfo.totalCount).toBe("2");
  });
});
