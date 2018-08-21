import * as faker from "faker";
import * as bcrypt from "bcryptjs";
import db from "../../../knex";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";
import { noUserError } from "../changePassword/errorMessages";

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("update Profile", () => {
  test("it works", async () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const currentPassword = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(currentPassword, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);
    await client.login(user.email, currentPassword);

    const response = await client.updateProfile(firstName, lastName);
    expect((response.data as any).updateProfile.error).toBeNull();
    expect((response.data as any).updateProfile.updateProfile).toEqual({
      id: user.id,
      email: user.email,
      firstName,
      lastName
    });

    const dbUser = await db("users")
      .where({ id: user.id })
      .first();

    expect(dbUser.firstName).toBe(firstName);
    expect(dbUser.lastName).toBe(lastName);
  });

  test("Does not work if not logged in", async () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const currentPassword = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      firstName: faker.name.firstName(),
      email: faker.internet.email(),
      password: await bcrypt.hash(currentPassword, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.updateProfile(firstName, lastName);
    expect(response).toEqual({
      data: {
        updateProfile: {
          error: [
            {
              message: noUserError,
              path: "updateProfile"
            }
          ],
          updateProfile: null
        }
      }
    });

    const dbUser = await db("users")
      .where({ id: user.id })
      .first();

    expect(dbUser.firstName).toBe(user.firstName);
    expect(dbUser.lastName).toBeNull();
  });
});
