import { Connection } from "typeorm";
import * as faker from "faker";
import * as jwt from "jsonwebtoken";

import { createTestConn } from "../../../testUtils/createTestConn";
import { User } from "../../../entity/User";
// import { TestClient } from "../../../utils/TestClient";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { redis } from "../../../redis";
import { userTokenVersionPrefix } from "../../../constants";
// import { redis } from "../../../redis";
// import { userSubscriptionTokenLookupPrefix } from "../../../constants";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;
let conn: Connection;

beforeAll(async () => {
  conn = await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});
afterAll(async () => {
  conn.close();
});

describe("me", () => {
  test("return null if no cookie", async () => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });

  test.only("get current user", async () => {
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    await client.login(email, password);
    const responseMe = (await client.me()) as any;
    expect(responseMe.data.me.email).toEqual(email);
    expect(responseMe.data.me.id).toEqual(userId);
  });

  test("me is null if version mismatch", async () => {
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    // attach a fake token with random number version so there is version mismatch
    client.token = jwt.sign(
      { id: userId, version: faker.random.number },
      process.env.JWT_SECRET as any,
      { expiresIn: "24h" }
    );
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });

  test("me is null if token expired", async () => {
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    // update redis store to force version number equality.
    const tokenVersion = faker.random.number();
    await redis.set(`${userTokenVersionPrefix}${userId}`, tokenVersion);
    // create expired token
    client.token = jwt.sign(
      {
        id: userId,
        version: tokenVersion,
        exp: Math.floor(Date.now() / 1000) - 3000
      },
      process.env.JWT_SECRET as any
    );
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });
});
