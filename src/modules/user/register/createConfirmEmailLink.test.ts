import * as Redis from "ioredis";
import fetch from "node-fetch";

// import db from "../../../knex";
import User from "../../../models/User";
import * as faker from "faker";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

const redis = new Redis();

let userId: string;

beforeAll(async () => {
  const user = await User.query().insert({
    email,
    password,
    confirmed: true
  });
  userId = user.id;
});

describe("test createConfirmEmailLink", () => {
  test("make sure it confirms user and clears key in redis", async () => {
    const url = await User.createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId
    );
    const response = await fetch(url);
    const text = await response.text();
    expect(text).toEqual("ok");

    const user = await User.query()
      .where({ id: userId })
      .first();
    // findOne({ where: { id: userId } });
    expect((user as User).confirmed).toBeTruthy();

    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];

    const value = await redis.get(key);
    expect(value).toBeNull();
  });
});
