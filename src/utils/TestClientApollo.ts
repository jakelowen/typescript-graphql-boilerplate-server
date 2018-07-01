/* tslint:disable no-implicit-dependencies*/
import { ApolloClient } from "apollo-client";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import gql from "graphql-tag";
import * as fetch from "node-fetch";

// let subscriptionToken = null;
// Create an http link:
// const httpLink = new HttpLink({
//   uri: process.env.TEST_HOST,
//   fetch
// } as any);

// Create a WebSocket link:
// const wsLink = new WebSocketLink({
//   uri: process.env.TEST_HOST_WS,
//   options: {
//     reconnect: true,
//     connectionParams: () => ({})
//   }
// } as any);

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
// const link = split(
//   // split based on operation type
//   ({ query }) => {
//     const { kind, operation } = getMainDefinition(query);
//     return kind === "OperationDefinition" && operation === "subscription";
//   },
//   wsLink,
//   httpLink
// );

export class TestClientApollo {
  url: string;
  token: string | undefined;
  client: ApolloClient<NormalizedCacheObject>;
  httpLink: HttpLink;
  wsLink: WebSocketLink;
  authLink: any;
  // options: { jar: any; withCredentials: boolean; json: true };
  constructor(url: string) {
    this.url = url;
    // this.options = { withCredentials: true, jar: rp.jar(), json: true };
    this.token = undefined;

    this.httpLink = new HttpLink({ uri: this.url, fetch } as any);
    // credentials: "include"

    this.wsLink = new WebSocketLink({
      uri: this.url.replace("http://", "ws://"),
      options: {
        reconnect: true,
        connectionParams: () => ({
          token: this.token
        })
      }
    } as any);

    this.authLink = setContext((_, { headers }) => {
      // get the authentication token from local storage if it exists
      // const token = localStorage.getItem("token");
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: this.token ? `Bearer ${this.token}` : ""
        }
      };
    });

    this.client = new ApolloClient({
      link: split(
        // split based on operation type
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === "OperationDefinition" && operation === "subscription";
        },
        this.wsLink,
        this.authLink.concat(this.httpLink)
      ),
      cache: new InMemoryCache({ addTypename: false })
    });
  }

  async login(email: string, password: string) {
    return this.client.mutate({
      mutation: gql`
      mutation {
          login(email: "${email}", password: "${password}") {
            error {
              path
              message
            }
            login
          }
        }
      `
    });
  }

  async register(email: string, password: string) {
    return this.client.mutate({
      mutation: gql`
      mutation {
        register(email: "${email}", password: "${password}") {
          error {
            path
            message
          }
          register
        }
      }
      `
    });
  }

  // async me() {
  //   return this.client.query({
  //     query: gql`
  //       query {
  //         me {
  //           id
  //           email
  //           subscriptionToken
  //         }
  //       }
  //     `
  //   });
  // }

  // async forgotPasswordChange(newPassword: string, key: string) {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `
  //       mutation {
  //         forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
  //           path
  //           message
  //         }
  //       }
  //       `
  //     }
  //   });
  // }

  // async register(email: string, password: string) {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `
  //       mutation {
  //         register(email: "${email}", password: "${password}") {
  //           path
  //           message
  //         }
  //       }
  //       `
  //     }
  //   });
  // }

  // async logout() {
  //   return rp.post(this.url, {
  //     ...this.options,
  //     body: {
  //       query: `
  //       mutation {
  //         logout
  //       }
  //       `
  //     }
  //   });
  // }
}
