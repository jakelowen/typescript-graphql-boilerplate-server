import * as rp from "request-promise";

export class TestClient {
  url: string;
  options: { jar: any; withCredentials: boolean; json: true };
  constructor(url: string) {
    this.url = url;
    this.options = { withCredentials: true, jar: rp.jar(), json: true };
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          login(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `
      }
    });
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        query {
          me {
            id
            email
            subscriptionToken
          }
        }
        `
      }
    });
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
            path
            message
          }
        }
        `
      }
    });
  }

  async register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          register(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `
      }
    });
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          logout
        }
        `
      }
    });
  }
}
