/* tslint:disable no-implicit-dependencies*/

// try to merge these examples
// https://github.com/apollographql/apollo-client/blob/b15c103f0b203fccbfd0c75a2446092177b43f8c/packages/apollo-client/src/__tests__/graphqlSubscriptions.ts
// the example from bryan from apollo-slack https://twitter.com/benawad97/status/1008899478387068929
// use this to send cookies: https://www.apollographql.com/docs/react/recipes/authentication.html
// websocket auth: https://www.apollographql.com/docs/react/advanced/subscriptions.html#authentication
import * as faker from "faker";
import gql from "graphql-tag";
// import User from "../../models/User";
import { TestClientApollo } from "../../utils/TestClientApollo";
import db from "../../knex";
faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

const defaultOptions = {
  query: gql`
    subscription {
      counter {
        count
      }
    }
  `
};

describe("subscriptions", () => {
  // works as expected.
  test(
    "should start a subscription on network interface and unsubscribe",
    async done => {
      const client = new TestClientApollo(process.env.TEST_HOST as string);
      await client.register(email, password);
      await db("users")
        .update({ confirmed: true })
        .where({ email });
      await client.login(email, password);

      // set up subscription listener
      const sub = client.client.subscribe(defaultOptions).subscribe({
        next(result) {
          expect(result).toEqual({
            data: {
              counter: {
                count: 0
              }
            }
          });
          sub.unsubscribe();
          done();
        }
      });
    },
    5000
  );

  test("Unauthed subscriptions are rejected", done => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    // jest.setTimeout(1000); // increase timeout
    client.client.subscribe(defaultOptions).subscribe(
      res => {
        console.log(res);
      },
      err => {
        expect(err).toEqual({ message: "NO TOKEN PRESENT" });
        done();
      }
    );
  });
});
