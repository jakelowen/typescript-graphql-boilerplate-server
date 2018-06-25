import { request } from "graphql-request";
// import { host } from './constants'
// import { createConnection } from 'typeorm';
import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";

const email = "bob@bob.com";
const password = "jalksdf";

const mutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeormConn();
});
afterAll(async () => {
  conn.close();
});

describe("Register User", async () => {
  test("check for duplicate email", async () => {
    // make sure we can register a user
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, password);

    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    // test for duplicate emails
    const response2 = await client.register(email, password);
    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  test("check bad email", async () => {
    // catch bad email
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register("b", password);

    expect(response.data).toEqual({
      register: [
        { message: emailNotLongEnough, path: "email" },
        { message: invalidEmail, path: "email" }
      ]
    });
  });

  test("check bad password", async () => {
    // catch bad password
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, "ad");

    expect(response.data).toEqual({
      register: [{ message: passwordNotLongEnough, path: "password" }]
    });
  });

  test("check bad password and bad email", async () => {
    // catch bad password and bad email
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register("df", "ad");

    expect(response.data).toEqual({
      register: [
        { message: emailNotLongEnough, path: "email" },
        { message: invalidEmail, path: "email" },
        { message: passwordNotLongEnough, path: "password" }
      ]
    });
  });
});
