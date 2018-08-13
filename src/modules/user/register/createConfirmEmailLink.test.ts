import * as Redis from "ioredis";
import fetch from "node-fetch";
import * as bcrypt from "bcryptjs";

import db from "../../../knex";
import * as faker from "faker";
import createConfirmEmailLink from "./logic/createConfirmEmailLink";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";

faker.seed(Date.now() + process.hrtime()[1]);

const redis = new Redis();

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("test createConfirmEmailLink", () => {
  test("make sure it confirms user and clears key in redis", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      user.id,
      redis
    );
    const response = await fetch(url, { redirect: "manual" }); // don't follow redirect
    const headers = response.headers.raw();

    expect(headers.location[0]).toBe(`${process.env.FRONTEND_HOST}/confirmed`);
    const dbUser = await db("users")
      .where({ id: user.id })
      .first();
    // findOne({ where: { id: userId } });
    expect(dbUser.confirmed).toBeTruthy();

    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];

    const value = await redis.get(key);
    expect(value).toBeNull();
  });
});
