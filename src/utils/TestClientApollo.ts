/* tslint:disable no-implicit-dependencies*/
import { ApolloClient } from "apollo-client";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import gql from "graphql-tag";
import * as fetch from "node-fetch";

export class TestClientApollo {
  url: string;
  token: any;
  client: ApolloClient<NormalizedCacheObject>;
  httpLink: HttpLink;
  errorLink: any;
  wsLink: WebSocketLink;
  authLink: any;
  // options: { jar: any; withCredentials: boolean; json: true };
  constructor(iUrl: string, iToken: any = null) {
    this.url = iUrl;
    // this.options = { withCredentials: true, jar: rp.jar(), json: true };
    this.token = iToken;
    // console.log("!!! in constructor, ", this.url, this.token);
    this.errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }

      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    });
    this.httpLink = new HttpLink({ uri: this.url, fetch } as any);
    // credentials: "include"

    this.wsLink = new WebSocketLink({
      uri: this.url.replace("http://", "ws://"),
      options: {
        // reconnect: true,
        inactivityTimeout: 100,
        timeout: 1000,
        connectionParams: () => ({
          token: this.token
        })
      }
    } as any);

    this.authLink = setContext((_, { headers }) => {
      // get the authentication token from local storage if it exists
      // const token = localStorage.getItem("token");
      // return the headers to the context so httpLink can read them
      // console.log("TOKEN!!!", this.token);
      return { headers: { ...headers, authorization: `Bearer ${this.token}` } };
    });

    this.client = new ApolloClient({
      link: split(
        // split based on operation type
        ({ query }) => {
          const {
            kind,
            operation
          }: {
            kind: string;
            operation?: string;
          } = getMainDefinition(query);
          return kind === "OperationDefinition" && operation === "subscription";
        },
        this.wsLink,
        this.authLink.concat(this.errorLink).concat(this.httpLink)
      ),
      cache: new InMemoryCache({ addTypename: false })
    });
  }

  async login(email: string, password: string) {
    const responseLogin = await this.client.mutate({
      mutation: gql`
      mutation {
          login(input: { email: "${email}", password: "${password}"}) {
            error {
              path
              message
            }
            login
          }
        }
      `
    });
    this.token = (responseLogin as any).data.login.login;
    return responseLogin;
  }

  async register(email: string, password: string) {
    return this.client.mutate({
      mutation: gql`
      mutation {
        register(input: {email: "${email}", password: "${password}"}) {
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

  async me() {
    return this.client.query({
      query: gql`
        query {
          me {
            id
            email
          }
        }
      `
    });
  }

  async logout() {
    this.token = null;
    return this.client.mutate({
      mutation: gql`
        mutation {
          logout
        }
      `
    });
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    this.token = null;
    return this.client.mutate({
      mutation: gql`
        mutation {
          forgotPasswordChange(input: {
            newPassword: "${newPassword}", 
            key: "${key}"
          }) {
            error {
              path
              message
            }
            forgotPasswordChange
          }
        }
      `
    });
  }

  async changePassword(newPassword: string, currentPassword: string) {
    return this.client.mutate({
      mutation: gql`
        mutation {
          changePassword(input: {
            newPassword: "${newPassword}", 
            currentPassword: "${currentPassword}"
          }) {
            error {
              path
              message
            }
            changePassword
          }
        }
      `
    });
  }

  async updateProfile(firstName?: string, lastName?: string) {
    return this.client.mutate({
      mutation: gql`
        mutation {
          updateProfile(input: {
            firstName: "${firstName}",
            lastName: "${lastName}"
          }) {
            error {
              path
              message
            }
            updateProfile {
              id
              email
              firstName
              lastName
            }
          }
        }
      `
    });
  }

  async sendForgotPasswordEmail(email: string) {
    this.token = null;
    return this.client.mutate({
      mutation: gql`
        mutation {
          sendForgotPasswordEmail(input: {
            email: "${email}"
          }) {
            sendForgotPasswordEmail
          }
        }
      `
    });
  }

  async resendConfirmationEmail(email: string) {
    this.token = null;
    return this.client.mutate({
      mutation: gql`
        mutation {
          resendConfirmationEmail(input: {
            email: "${email}"
          }) {
            error {
              path
              message
            }
            resendConfirmationEmail
          }
        }
      `
    });
  }
}
