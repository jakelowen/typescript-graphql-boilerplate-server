// import * as faker from "faker";
// import * as Redis from "ioredis";

import db from "../../knex";
import { filterQuery } from "./filterQuery";

// beforeAll(async () => {});
// afterAll(async () => db.destroy());
const tableName = "foo";

describe("Filter Query Ops", () => {
  test("_is", async () => {
    const query = db(tableName);
    const data = "baz";
    const fq = filterQuery(query, { bar_is: data });
    expect(fq).toEqual(db(tableName).where("bar", "=", data));
  });

  test("_not", async () => {
    const query = db(tableName);
    const data = "baz";
    const fq = filterQuery(query, { bar_not: data });
    expect(fq).toEqual(db(tableName).where("bar", "!=", data));
  });

  test("_in", async () => {
    const query = db(tableName);
    const data = ["baz", "bam"];
    const fq = filterQuery(query, { bar_in: data });
    expect(fq).toEqual(db(tableName).whereIn("bar", data));
  });

  test("_notin", async () => {
    const query = db(tableName);
    const data = ["baz", "bam"];
    const fq = filterQuery(query, { bar_notin: data });
    expect(fq).toEqual(db(tableName).whereNotIn("bar", data));
  });

  test("_lt", async () => {
    const query = db(tableName);
    const data = 5;
    const fq = filterQuery(query, { bar_lt: data });
    expect(fq).toEqual(db(tableName).where("bar", "<", data));
  });

  test("_lte", async () => {
    const query = db(tableName);
    const data = 5;
    const fq = filterQuery(query, { bar_lte: data });
    expect(fq).toEqual(db(tableName).where("bar", "<=", data));
  });

  test("_gt", async () => {
    const query = db(tableName);
    const data = 5;
    const fq = filterQuery(query, { bar_gt: data });
    expect(fq).toEqual(db(tableName).where("bar", ">", data));
  });

  test("_gte", async () => {
    const query = db(tableName);
    const data = 5;
    const fq = filterQuery(query, { bar_gte: data });
    expect(fq).toEqual(db(tableName).where("bar", ">=", data));
  });

  test("_contains", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, { bar_contains: data });
    expect(fq).toEqual(db(tableName).where("bar", "ILIKE", `%${data}%`));
  });

  test("_notcontains", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, { bar_notcontains: data });
    expect(fq).toEqual(db(tableName).where("bar", "NOT ILIKE", `%${data}%`));
  });

  test("_startswith", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, { bar_startswith: data });
    expect(fq).toEqual(db(tableName).where("bar", "ILIKE", `${data}%`));
  });

  test("_notstartswith", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, { bar_notstartswith: data });
    expect(fq).toEqual(db(tableName).where("bar", "NOT ILIKE", `${data}%`));
  });

  test("_endswith", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, { bar_endswith: data });
    expect(fq).toEqual(db(tableName).where("bar", "ILIKE", `%${data}`));
  });

  test("_notendswith", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, { bar_notendswith: data });
    expect(fq).toEqual(db(tableName).where("bar", "NOT ILIKE", `%${data}`));
  });

  test("AND", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, {
      AND: [{ foo_is: data }, { bar_is: data }]
    });
    const rawQuery = db(tableName)
      .andWhere(function() {
        this.where("foo", data);
      })
      .andWhere(function() {
        this.where("bar", data);
      });
    expect(fq.toSQL().sql).toEqual(rawQuery.toSQL().sql);
    expect(fq.toSQL().method).toEqual(rawQuery.toSQL().method);
    expect(fq.toSQL().bindings).toEqual(rawQuery.toSQL().bindings);
  });

  test("OR", async () => {
    const query = db(tableName);
    const data = "badddd";
    const fq = filterQuery(query, {
      OR: [{ foo_is: data }, { bar_is: data }]
    });
    const rawQuery = db(tableName)
      .orWhere(function() {
        this.orWhere("foo", data);
      })
      .orWhere(function() {
        this.orWhere("bar", data);
      });
    expect(fq.toSQL().sql).toEqual(rawQuery.toSQL().sql);
    expect(fq.toSQL().method).toEqual(rawQuery.toSQL().method);
    expect(fq.toSQL().bindings).toEqual(rawQuery.toSQL().bindings);
  });
});
