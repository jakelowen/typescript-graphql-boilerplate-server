import * as faker from "faker";
import * as jwt from "jsonwebtoken";

import { invalidLogin, confirmEmailError } from "./errorMessages";
import User from "../../../models/User";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { redis } from "../../../redis";
import { userTokenVersionPrefix } from "../../../constants";
import { TokenPayload } from "../../../types/graphql-utils";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

const loginExpectError = async (
  client: TestClientApollo,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);
  expect(response.data).toEqual({
    login: { error: [{ path: "email", message: errMsg }], login: null }
  });
};

describe("login", () => {
  test("email not found sends back error", async () => {
    const clientApollo = new TestClientApollo(process.env.TEST_HOST as string);
    await loginExpectError(
      clientApollo,
      "foo@bob.com",
      "whatever",
      invalidLogin
    );
  });

  test("email not confirmed", async () => {
    const clientApollo = new TestClientApollo(process.env.TEST_HOST as string);
    await clientApollo.register(email, password);

    await loginExpectError(clientApollo, email, password, confirmEmailError);

    await User.query()
      .update({ confirmed: true })
      .where({ email });

    await loginExpectError(clientApollo, email, "fdsaffdsafdsa", invalidLogin);

    const response = await clientApollo.login(email, password);
    // get token from response
    let token;
    if (response.data) {
      expect(response.data.login.login).not.toBeNull();
      token = response.data.login.login;
    } else {
      throw new Error("No response");
    }
    // validate token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env
        .JWT_SECRET as string) as TokenPayload;
    } catch {
      throw new Error("Token is malformed");
    }
    // make sure token id = user id
    const idLookupUser = await User.query()
      .where({
        id: decoded.id
      })
      .first();
    if (idLookupUser) {
      expect(idLookupUser.email as string).toEqual(email);
    } else {
      throw new Error("User should exist");
    }

    // make sure token version = user version
    const tokenVersion = await redis.get(
      `${userTokenVersionPrefix}${decoded.id}`
    );
    expect(decoded.version).toEqual(parseInt(tokenVersion, 10));
  });
});
