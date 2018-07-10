import * as faker from "faker";
import * as bcrypt from "bcryptjs";

import { TestClientApollo } from "../../../utils/TestClientApollo";
import db from "../../../knex";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;

beforeAll(async () => {
  const user = await db("users")
    .insert({
      email,
      password: await bcrypt.hash(password, 10),
      confirmed: true
    })
    .returning("*");
  userId = user[0].id;
});

describe("logout", () => {
  test("multiple sessions", async () => {
    const ss1 = new TestClientApollo(process.env.TEST_HOST as string);
    const ss2 = new TestClientApollo(process.env.TEST_HOST as string);

    await ss1.login(email, password);
    await ss2.login(email, password);
    expect(await ss1.me()).toEqual(await ss2.me());

    await ss1.logout();
    expect(await ss1.me()).toEqual(await ss2.me());
  });

  test("single session", async () => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = (await client.me()) as any;
    expect(response.data.me.email).toEqual(email);
    expect(response.data.me.id).toEqual(userId);
  });
});
