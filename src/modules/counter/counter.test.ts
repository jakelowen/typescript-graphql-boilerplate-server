/* tslint:disable no-implicit-dependencies*/

// try to merge these examples
// https://github.com/apollographql/apollo-client/blob/b15c103f0b203fccbfd0c75a2446092177b43f8c/packages/apollo-client/src/__tests__/graphqlSubscriptions.ts
// the example from bryan from apollo-slack https://twitter.com/benawad97/status/1008899478387068929
// use this to send cookies: https://www.apollographql.com/docs/react/recipes/authentication.html
// websocket auth: https://www.apollographql.com/docs/react/advanced/subscriptions.html#authentication
import * as faker from "faker";
import gql from "graphql-tag";
import { User } from "../../entity/User";
import { createTestConn } from "../../testUtils/createTestConn";
import { Connection } from "typeorm";
import { TestClientApollo } from "../../utils/TestClientApollo";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

let conn: Connection;

const defaultOptions = {
  query: gql`
    subscription {
      counter {
        count
      }
    }
  `
};

beforeAll(async () => {
  conn = await createTestConn();
});
afterAll(async () => {
  conn.close();
});

describe("subscriptions", () => {
  // works as expected.
  test("should start a subscription on network interface and unsubscribe", async done => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    await client.register(email, password);
    await User.update({ email }, { confirmed: true });
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
  });

  // Does not work! I am expecting an error.
  test("Unauthed subscriptions are rejected", done => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

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

    // Received value must be a function, but instead "object" was found
    expect(sub).toThrow();
  });

  // does not work
  // Error: Uncaught { message: 'NO TOKEN PRESENT' }
  test("Unauthed subscriptions are rejected second attempt", done => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    try {
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
          // done();
        }
      });
    } catch (error) {
      console.log(error);
      expect(error).toEqual({
        message: "NO TOKEN PRESENT"
      });
      done();
    }
  });

  // does not work
  // Error: Uncaught { message: 'NO TOKEN PRESENT' }
  test("Unauthed subscriptions are rejected second attempt", done => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    try {
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
          // done();
        }
      });
    } catch (error) {
      console.log(error);
      expect(error).toEqual({
        message: "NO TOKEN PRESENT"
      });
      done();
    }
  });

  // does not work
  // Expected the function to throw an error.
  // But it didn't throw anything.
  test("Unauthed subscriptions are rejected third attempt", done => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    expect(async () => {
      const sub = await client.client.subscribe(defaultOptions).subscribe({
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
    }).toThrowError();
  });

  // does not work
  // Expected the function to throw an error.
  // But it didn't throw anything.
  test("Unauthed subscriptions are rejected fourth attempt", done => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);

    const attempt = async () => {
      const sub = await client.client.subscribe(defaultOptions).subscribe({
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
    };

    expect(attempt).toThrowError();
  });
});

// const attempt = () => {
//   client.client.subscribe(defaultOptions).subscribe({
//     next(result) {
//       try {
//         console.log(result);
//         expect(result).toEqual({ data: { counter: { count: 0 } } });
//       } catch (error) {
//         console.log(error);
//       }

//       // sub.unsubscribe();
//     }
//   });
// };

// // attempt();

// expect(attempt()).toThrow();
// done();
