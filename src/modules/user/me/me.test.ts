import * as jwt from "jsonwebtoken";
import * as faker from "faker";
import * as bcrypt from "bcryptjs";

import db from "../../../knex";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { redis } from "../../../redis";
import { userTokenVersionPrefix } from "../../../constants";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("me", () => {
  test("return null if no valid token", async () => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });

  test("get current user", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    await client.login(user.email, password);
    const responseMe = (await client.me()) as any;
    expect(responseMe.data.me.email).toEqual(user.email);
    expect(responseMe.data.me.id).toEqual(user.id);
  });

  test("me is null if version mismatch", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    // attach a fake token with random number version so there is version mismatch
    client.token = jwt.sign(
      { id: user.id, version: faker.random.number },
      process.env.JWT_SECRET as any,
      { expiresIn: "24h" }
    );
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });

  test("me is null if token expired", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    // update redis store to force version number equality.
    const tokenVersion = faker.random.number();
    await redis.set(`${userTokenVersionPrefix}${user.id}`, tokenVersion);
    // create expired token
    client.token = jwt.sign(
      {
        id: user.id,
        version: tokenVersion,
        exp: Math.floor(Date.now() / 1000) - 3000
      },
      process.env.JWT_SECRET as any
    );
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });
});
