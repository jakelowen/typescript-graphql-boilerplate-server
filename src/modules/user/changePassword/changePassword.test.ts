import * as faker from "faker";
import * as bcrypt from "bcryptjs";
import db from "../../../knex";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";
import { badPassError, noUserError } from "./errorMessages";

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("change password", () => {
  test("it works", async () => {
    const currentPassword = faker.internet.password();
    const newPassword = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(currentPassword, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);
    await client.login(user.email, currentPassword);
    const response = await client.changePassword(newPassword, currentPassword);
    expect(response).toEqual({
      data: {
        changePassword: {
          error: null,
          changePassword: true
        }
      }
    });

    const dbUser = await db("users")
      .where({ id: user.id })
      .first();
    expect(await bcrypt.compare(newPassword, dbUser.password)).toBe(true);
  });

  test("bad current password does not work.", async () => {
    const currentPassword = faker.internet.password();
    const newPassword = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(currentPassword, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);
    await client.login(user.email, currentPassword);
    const response = await client.changePassword(
      newPassword,
      "FDFSDAFDSAccccc"
    );
    expect(response).toEqual({
      data: {
        changePassword: {
          error: [
            {
              message: badPassError,
              path: "changePassword"
            }
          ],
          changePassword: false
        }
      }
    });

    const dbUser = await db("users")
      .where({ id: user.id })
      .first();
    expect(await bcrypt.compare(currentPassword, dbUser.password)).toBe(true);
  });

  test("Does not work if not logged in", async () => {
    const currentPassword = faker.internet.password();
    const newPassword = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(currentPassword, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.changePassword(newPassword, currentPassword);
    expect(response).toEqual({
      data: {
        changePassword: {
          error: [
            {
              message: noUserError,
              path: "changePassword"
            }
          ],
          changePassword: false
        }
      }
    });

    const dbUser = await db("users")
      .where({ id: user.id })
      .first();
    expect(await bcrypt.compare(currentPassword, dbUser.password)).toBe(true);
  });

  // test("send forgotPassword Email", async () => {
  //   const password = faker.internet.password();
  //   const user = {
  //     id: faker.random.uuid(),
  //     email: faker.internet.email(),
  //     password: await bcrypt.hash(password, 10),
  //     confirmed: true
  //   };
  //   await db("users").insert(user);

  //   const client = new TestClientApollo(process.env.TEST_HOST as string);
  //   const response = await client.sendForgotPasswordEmail(user.email);
  //   expect(response).toEqual({
  //     data: {
  //       sendForgotPasswordEmail: {
  //         sendForgotPasswordEmail: true
  //       }
  //     }
  //   });
  // });

  // test("password change is successful", async () => {
  //   const password = faker.internet.password();
  //   const newPassword = "fdafdsarewewrtggdd";
  //   const user = {
  //     id: faker.random.uuid(),
  //     email: faker.internet.email(),
  //     password: await bcrypt.hash(password, 10),
  //     confirmed: true
  //   };
  //   await db("users").insert(user);

  //   const client = new TestClientApollo(process.env.TEST_HOST as string);

  //   const url = await createForgotPasswordLink(user.id, redis);
  //   const parts = url.split("/");
  //   const key = parts[parts.length - 1];

  //   // now change password
  //   expect(await client.forgotPasswordChange(newPassword, key)).toEqual({
  //     data: {
  //       forgotPasswordChange: {
  //         forgotPasswordChange: true,
  //         error: null
  //       }
  //     }
  //   });

  //   // make sure redis key expires after password change
  //   expect(await client.forgotPasswordChange("lotsagibberish", key)).toEqual({
  //     data: {
  //       forgotPasswordChange: {
  //         error: [
  //           {
  //             path: "key",
  //             message: expiredKeyError
  //           }
  //         ],
  //         forgotPasswordChange: false
  //       }
  //     }
  //   });

  //   // successfully log in with new password
  //   const loginResponse = (await client.login(user.email, newPassword)) as any;
  //   expect(loginResponse.data.login.error).toBeNull();
  //   expect(loginResponse.data.login.login).not.toBeNull();
  // });
});
