import * as faker from "faker";
import * as jwt from "jsonwebtoken";

import { invalidLogin, confirmEmailError } from "./errorMessages";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { redis } from "../../../redis";
import { userTokenVersionPrefix } from "../../../constants";
import { TokenPayload } from "../../../types/graphql-utils";
import db from "../../../knex";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("login", () => {
  test("email not found sends back error", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await client.login(email, password);
    expect(response.data).toEqual({
      login: {
        error: [{ path: "email", message: invalidLogin }],
        login: null
      }
    });
  });

  test("email not confirmed", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    await client.register(email, password);

    const response = await client.login(email, password);
    expect(response.data).toEqual({
      login: {
        error: [{ path: "email", message: confirmEmailError }],
        login: null
      }
    });

    await db("users")
      .update({ confirmed: true })
      .where({ email });

    const response2 = await client.login(email, "fdsaffdsafdsa");
    expect(response2.data).toEqual({
      login: {
        error: [{ path: "email", message: invalidLogin }],
        login: null
      }
    });

    const response3 = await client.login(email, password);
    // get token from response
    let token;
    if (response3.data) {
      expect(response3.data.login.login).not.toBeNull();
      token = response3.data.login.login;
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
    const idLookupUser = await db("users")
      .where({ id: decoded.id })
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
