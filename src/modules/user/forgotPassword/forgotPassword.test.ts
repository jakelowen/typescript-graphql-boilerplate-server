import * as faker from "faker";

import User from "../../../models/User";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { passwordNotLongEnough } from "../register/errorMessages";
import { expiredKeyError } from "./errorMessages";

let userId: string;

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();
const newPassword = "fdafdsarewewrtggdd";

beforeAll(async () => {
  const user = await User.query().insert({
    email,
    password,
    confirmed: true
  });
  userId = user.id;
});

describe("forgot password", () => {
  test("make sure it works", async () => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    const url = await User.createForgotPasswordLink(userId);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

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
