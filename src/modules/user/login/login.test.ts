import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../../entity/User";
import { createTestConn } from "../../../testUtils/createTestConn";
import { Connection } from "typeorm";
import { TestClient } from "../../../utils/TestClient";
import * as faker from "faker";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);
  expect(response.data).toEqual({
    login: [{ path: "email", message: errMsg }]
  });
};

let conn: Connection;

beforeAll(async () => {
  conn = await createTestConn();
});
afterAll(async () => {
  conn.close();
});

describe("login", () => {
  test("email not found sends back error", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(client, "foo@bob.com", "whatever", invalidLogin);
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);

    await loginExpectError(client, email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(client, email, "fdsaffdsafdsa", invalidLogin);

    const response = await client.login(email, password);
    expect(response.data).toEqual({ login: null });
  });
});
