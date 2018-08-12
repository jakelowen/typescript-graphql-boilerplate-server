import * as faker from "faker";
import * as Redis from "ioredis";
import * as bcrypt from "bcryptjs";
import db from "../../../knex";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { expiredKeyError } from "./errorMessages";
import { passwordNotLongEnough } from "../shared/errorMessages";
import createForgotPasswordLink from "./logic/createForgotPasswordLink";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";

const redis = new Redis();

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("forgot password", () => {
  test("too short password is rejected", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);

    const url = await createForgotPasswordLink(user.id, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    // try changing password thats too short
    expect(await client.forgotPasswordChange("aa", key)).toEqual({
      data: {
        forgotPasswordChange: {
          error: [
            {
              path: "newPassword",
              message: passwordNotLongEnough
            }
          ],
          forgotPasswordChange: false
        }
      }
    });
  });

  test("send forgotPassword Email", async () => {
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.sendForgotPasswordEmail(user.email);
    expect(response).toEqual({
      data: {
        sendForgotPasswordEmail: {
          sendForgotPasswordEmail: true
        }
      }
    });
  });

  test("password change is successful", async () => {
    const password = faker.internet.password();
    const newPassword = "fdafdsarewewrtggdd";
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: true
    };
    await db("users").insert(user);

    const client = new TestClientApollo(process.env.TEST_HOST as string);

    const url = await createForgotPasswordLink(user.id, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    // now change password
    expect(await client.forgotPasswordChange(newPassword, key)).toEqual({
      data: {
        forgotPasswordChange: {
          forgotPasswordChange: true,
          error: null
        }
      }
    });

    // make sure redis key expires after password change
    expect(await client.forgotPasswordChange("lotsagibberish", key)).toEqual({
      data: {
        forgotPasswordChange: {
          error: [
            {
              path: "key",
              message: expiredKeyError
            }
          ],
          forgotPasswordChange: false
        }
      }
    });

    // successfully log in with new password
    const loginResponse = (await client.login(user.email, newPassword)) as any;
    expect(loginResponse.data.login.error).toBeNull();
    expect(loginResponse.data.login.login).not.toBeNull();
  });
});
