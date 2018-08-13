import * as faker from "faker";

import db from "../../../knex";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { invalidEmail } from "./errorMessages";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";
import * as bcrypt from "bcryptjs";

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("Resend Confirmation Email to User", async () => {
  test("should respond true even if no user", async () => {
    const email = faker.internet.email();

    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.resendConfirmationEmail(email);

    expect(response.data).toEqual({
      resendConfirmationEmail: {
        resendConfirmationEmail: true,
        error: null
      }
    });
  });

  test("should work", async () => {
    // TODO: This is a really weak test because without
    // properly spying on the email sender function, I can't actually
    // verify it was sent. Improve this
    const password = faker.internet.password();
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      confirmed: false
    };
    await db("users").insert(user);

    // make sure we can register a user
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.resendConfirmationEmail(user.email);

    expect(response.data).toEqual({
      resendConfirmationEmail: {
        resendConfirmationEmail: true,
        error: null
      }
    });
  });

  test("poorly formatted email should not work", async () => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.resendConfirmationEmail("badEmail");

    expect(
      (response.data as any).resendConfirmationEmail.resendConfirmationEmail
    ).toEqual(false);

    expect((response.data as any).resendConfirmationEmail.error.length).toBe(1);
    expect(
      (response.data as any).resendConfirmationEmail.error[0].message
    ).toEqual(invalidEmail);
  });
});
