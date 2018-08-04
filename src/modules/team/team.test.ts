// import generateDeterministicCacheId from "./generateDeterministicCacheId";
// import decodeDeterministicCacheId from "./decodeDeterministicCacheId";
import db from "../../knex";
// import loadSinglePage from "./loadSinglePage";
import * as faker from "faker";
import { TestClientApollo } from "../../utils/TestClientApollo";
import gql from "graphql-tag";
// import { redis } from "../../redis";

faker.seed(Date.now() + process.hrtime()[1]);

// beforeEach(async () =>
//   Promise.all([db.raw("TRUNCATE TABLE teams CASCADE"), redis.flushall()]));

describe("Teams", () => {
  test("multi teams search working", async () => {
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
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.query({
      query: gql`
        query teams($teamsinput: TeamsInput) {
          teams(input: $teamsinput) {
            items {
              id
              name
            }
          }
        }
      `,
      variables: {
        teamsinput: {
          where: { name_startswith: randomLeader },
          noCache: true,
          orderBy: [{ sort: "name", direction: "ASC" }]
        }
      }
    });

    expect((response.data as any).teams.items[0].id).toEqual(teams[0].id);
  });

  test("single team search working", async () => {
    const teams = [
      { id: faker.random.uuid(), name: faker.company.companyName() }
    ];

    await db("teams").insert(teams);
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.query({
      query: gql`
        query team($teaminput: TeamInput) {
          team(input: $teaminput) {
            team {
              id
              name
            }
          }
        }
      `,
      variables: { teaminput: { where: { id: teams[0].id } } }
    });
    expect((response.data as any).team.team.id).toEqual(teams[0].id);
  });
});
