import { Connection } from "typeorm";
import * as faker from "faker";
import * as Redis from "ioredis";

import { User } from "../../../entity/User";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { passwordNotLongEnough } from "../register/errorMessages";
import { expiredKeyError } from "./errorMessages";
import { createTestConn } from "../../../testUtils/createTestConn";

let conn: Connection;

let userId: string;
const redis = new Redis();

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();
const newPassword = "fdafdsarewewrtggdd";

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

describe("forgot password", () => {
  test("make sure it works", async () => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    const url = await createForgotPasswordLink("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    // skipping weird lock account stuff.
    // expect("account locking").toEqual(false);

    // try changing password thats too short
    expect(await client.forgotPasswordChange("aa", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "newPassword",
            message: passwordNotLongEnough
          }
        ]
      }
    });

    // now change password
    expect(await client.forgotPasswordChange(newPassword, key)).toEqual({
      data: { forgotPasswordChange: null }
    });

    // make sure redis key expires after password change
    expect(await client.forgotPasswordChange("lotsagibberish", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "key",
            message: expiredKeyError
          }
        ]
      }
    });

    // successfully log in with new password
    const loginResponse = (await client.login(email, newPassword)) as any;
    expect(loginResponse.data.login.error).toBeNull();
    expect(loginResponse.data.login.login).not.toBeNull();
  });
});
