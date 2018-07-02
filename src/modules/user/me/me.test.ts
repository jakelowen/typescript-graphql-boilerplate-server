import { Connection } from "typeorm";
import * as faker from "faker";

import { createTestConn } from "../../../testUtils/createTestConn";
import { User } from "../../../entity/User";
// import { TestClient } from "../../../utils/TestClient";
import { TestClientApollo } from "../../../utils/TestClientApollo";
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

  test("get current user", async () => {
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    await client.login(email, password);
    const responseMe = (await client.me()) as any;
    expect(responseMe.data.me.email).toEqual(email);
    expect(responseMe.data.me.id).toEqual(userId);
  });
});
