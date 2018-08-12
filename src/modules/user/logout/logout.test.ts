import * as faker from "faker";
import * as bcrypt from "bcryptjs";

import { TestClientApollo } from "../../../utils/TestClientApollo";
import db from "../../../knex";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";

beforeEach(async () => {
  await beforeEachTruncate();
});

faker.seed(Date.now() + process.hrtime()[1]);

describe("logout", () => {
  test("multiple sessions", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const ss1 = new TestClientApollo(process.env.TEST_HOST as string);
    const ss2 = new TestClientApollo(process.env.TEST_HOST as string);

    await ss1.login(user.email, password);
    await ss2.login(user.email, password);
    expect(await ss1.me()).toEqual(await ss2.me());

    await ss1.logout();
    expect(await ss1.me()).toEqual(await ss2.me());
  });

  test("single session", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    await client.login(user.email, password);

    const response = (await client.me()) as any;
    expect(response.data.me.email).toEqual(user.email);
    expect(response.data.me.id).toEqual(user.id);
  });
});
