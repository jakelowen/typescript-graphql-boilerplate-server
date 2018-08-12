// import generateDeterministicCacheId from "./generateDeterministicCacheId";
// import decodeDeterministicCacheId from "./decodeDeterministicCacheId";
import db from "../../../knex";
// import loadSinglePage from "./loadSinglePage";
import * as faker from "faker";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import gql from "graphql-tag";
import * as bcrypt from "bcryptjs";
import {
  noPermissionByName,
  noTeamExists,
  noUserExists,
  duplicatePermission,
  notTeamAdminError
} from "./logic/errors";
import beforeEachTruncate from "../../../testUtils/beforeEachTruncate";

// import { redis } from "../../redis";

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("Permissions", () => {
  test("can get user permissions", async () => {
    // const newTeamName = faker.company.companyName();
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: "foo"
    };
    const permission = { id: faker.random.number(), name: "USER" };
    const gtp = {
      id: faker.random.uuid(),
      permissionId: permission.id,
      userId: user.id,
      teamId: team.id
    };

    await db("teams").insert(team);
    await db("users").insert(user);
    await db("permissions").insert(permission);
    await db("granted_team_permissions").insert(gtp);

    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.query({
      query: gql`
        query team($teaminput: TeamInput) {
          team(input: $teaminput) {
            team {
              id
              name
              users {
                id
                email
                permissions {
                  id
                  name
                  team {
                    id
                  }
                }
              }
            }
          }
        }
      `,
      variables: { teaminput: { where: { id: team.id } } }
    });
    expect((response.data as any).team.team.id).toEqual(team.id);
    expect((response.data as any).team.team.users.length).toBe(1);
    expect((response.data as any).team.team.users[0].id).toEqual(user.id);
    expect((response.data as any).team.team.users[0].email).not.toEqual(
      user.email
    );
    expect((response.data as any).team.team.users[0].permissions[0].id).toEqual(
      gtp.id
    );
    expect(
      (response.data as any).team.team.users[0].permissions[0].name
    ).toEqual(permission.name);
    expect(
      (response.data as any).team.team.users[0].permissions[0].team.id
    ).toEqual(team.id);
  });
});

describe("addPermissionMutation", () => {
  test("can not add if not team admin", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: "foo"
    };
    const permission = {
      id: faker.random.number(),
      name: faker.random.word().toUpperCase()
    };

    await db("teams").insert(team);
    await db("users").insert(user);
    await db("permissions").insert(permission);

    // console.log(team,user,permission)
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation addPermission($input: addPermissionInput!) {
          addPermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permission.name,
          userId: user.id,
          teamId: team.id
        }
      }
    });
    expect((response.data as any).addPermission.error.length).toBe(1);
    expect((response.data as any).addPermission.error[0].message).toEqual(
      notTeamAdminError
    );
  });

  test("works", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    const password = faker.internet.password();

    const users = [
      {
        id: faker.random.uuid(),
        email: faker.internet.email(),
        password: "foo"
      },
      {
        email: faker.internet.email(),
        password: await bcrypt.hash(password, 10),
        id: faker.random.uuid(),
        confirmed: true
      }
    ];

    const permissions = [
      { id: faker.random.number(), name: faker.random.word().toUpperCase() },
      { id: faker.random.number(), name: "ADMIN" }
    ];

    const gtp = {
      id: faker.random.uuid(),
      permissionId: permissions[1].id,
      userId: users[1].id,
      teamId: team.id
    };

    await db("teams").insert(team);
    await db("users").insert(users);
    await db("permissions").insert(permissions);
    await db("granted_team_permissions").insert(gtp);

    // console.log(team,user,permission)
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    // login
    await testClient.login(users[1].email, password);

    const response = await testClient.client.mutate({
      mutation: gql`
        mutation addPermission($input: addPermissionInput!) {
          addPermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permissions[0].name,
          userId: users[0].id,
          teamId: team.id
        }
      }
    });
    expect((response.data as any).addPermission.error).toBeNull();
    expect((response.data as any).addPermission.permission.name).toEqual(
      permissions[0].name
    );
    expect((response.data as any).addPermission.permission.team.id).toEqual(
      team.id
    );
  });

  test("can not apply duplicate permission", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: "foo"
    };
    const permission = { id: faker.random.number(), name: "USER" };
    const gtp = {
      id: faker.random.uuid(),
      permissionId: permission.id,
      userId: user.id,
      teamId: team.id
    };

    await db("teams").insert(team);
    await db("users").insert(user);
    await db("permissions").insert(permission);
    await db("granted_team_permissions").insert(gtp);

    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation addPermission($input: addPermissionInput!) {
          addPermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permission.name,
          userId: user.id,
          teamId: team.id
        }
      }
    });
    expect((response.data as any).addPermission.error.length).toBe(1);
    expect((response.data as any).addPermission.error[0].message).toEqual(
      duplicatePermission
    );
  });

  test("user does not exist error", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    await db("teams").insert(team);
    const permission = {
      id: faker.random.number(),
      name: faker.random.word().toUpperCase()
    };
    await db("permissions").insert(permission);

    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation addPermission($input: addPermissionInput!) {
          addPermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permission.name,
          userId: faker.random.uuid(),
          teamId: team.id
        }
      }
    });
    expect((response.data as any).addPermission.error.length).toBe(1);
    expect((response.data as any).addPermission.error[0].message).toEqual(
      noUserExists
    );
  });

  test("team does not exist error", async () => {
    const permission = {
      id: faker.random.number(),
      name: faker.random.word().toUpperCase()
    };
    await db("permissions").insert(permission);

    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation addPermission($input: addPermissionInput!) {
          addPermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permission.name,
          userId: faker.random.uuid(),
          teamId: faker.random.uuid()
        }
      }
    });
    expect((response.data as any).addPermission.error.length).toBe(1);
    expect((response.data as any).addPermission.error[0].message).toEqual(
      noTeamExists
    );
  });

  test("permission does not exist error", async () => {
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation addPermission($input: addPermissionInput!) {
          addPermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: faker.random.word(),
          userId: faker.random.uuid(),
          teamId: faker.random.uuid()
        }
      }
    });
    expect((response.data as any).addPermission.error.length).toBe(1);
    expect((response.data as any).addPermission.error[0].message).toEqual(
      noPermissionByName
    );
  });
});

describe("removePermissionMutation", () => {
  test("can not remove if not team admin", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    const user = {
      id: faker.random.uuid(),
      email: faker.internet.email(),
      password: "foo"
    };
    const permission = {
      id: faker.random.number(),
      name: faker.random.word().toUpperCase()
    };

    await db("teams").insert(team);
    await db("users").insert(user);
    await db("permissions").insert(permission);

    // console.log(team,user,permission)
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation removePermission($input: removePermissionInput!) {
          removePermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permission.name,
          userId: user.id,
          teamId: team.id
        }
      }
    });
    expect((response.data as any).removePermission.error.length).toBe(1);
    expect((response.data as any).removePermission.error[0].message).toEqual(
      notTeamAdminError
    );
  });

  test("works", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    const password = faker.internet.password();

    const users = [
      {
        id: faker.random.uuid(),
        email: faker.internet.email(),
        password: "foo"
      },
      {
        email: faker.internet.email(),
        password: await bcrypt.hash(password, 10),
        id: faker.random.uuid(),
        confirmed: true
      }
    ];

    const permissions = [
      {
        id: faker.random.number(),
        name: faker.random.word().toUpperCase()
      },
      { id: faker.random.number(), name: "ADMIN" }
    ];

    const gtps = [
      {
        id: faker.random.uuid(),
        permissionId: permissions[1].id,
        userId: users[1].id,
        teamId: team.id
      },
      {
        id: faker.random.uuid(),
        permissionId: permissions[0].id,
        userId: users[0].id,
        teamId: team.id
      }
    ];

    await db("teams").insert(team);
    await db("users").insert(users);
    await db("permissions").insert(permissions);
    await db("granted_team_permissions").insert(gtps);

    // console.log(team,user,permission)
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    // login
    await testClient.login(users[1].email, password);

    const response = await testClient.client.mutate({
      mutation: gql`
        mutation removePermission($input: removePermissionInput!) {
          removePermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permissions[0].name,
          userId: users[0].id,
          teamId: team.id
        }
      }
    });
    expect((response.data as any).removePermission.error).toBeNull();
    const dbGTP = await db("granted_team_permissions")
      .where({ id: gtps[1].id })
      .first();
    expect(dbGTP).toBeUndefined();
  });

  test("user does not exist error", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    await db("teams").insert(team);
    const permission = {
      id: faker.random.number(),
      name: faker.random.word().toUpperCase()
    };
    await db("permissions").insert(permission);

    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation removePermission($input: removePermissionInput!) {
          removePermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permission.name,
          userId: faker.random.uuid(),
          teamId: team.id
        }
      }
    });
    expect((response.data as any).removePermission.error.length).toBe(1);
    expect((response.data as any).removePermission.error[0].message).toEqual(
      noUserExists
    );
  });

  test("team does not exist error", async () => {
    const permission = {
      id: faker.random.number(),
      name: faker.random.word().toUpperCase()
    };
    await db("permissions").insert(permission);

    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation removePermission($input: removePermissionInput!) {
          removePermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: permission.name,
          userId: faker.random.uuid(),
          teamId: faker.random.uuid()
        }
      }
    });
    expect((response.data as any).removePermission.error.length).toBe(1);
    expect((response.data as any).removePermission.error[0].message).toEqual(
      noTeamExists
    );
  });

  test("permission does not exist error", async () => {
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation removePermission($input: removePermissionInput!) {
          removePermission(input: $input) {
            error {
              path
              message
            }
            permission {
              id
              name
              team {
                id
              }
            }
          }
        }
      `,
      variables: {
        input: {
          permissionName: faker.random.word(),
          userId: faker.random.uuid(),
          teamId: faker.random.uuid()
        }
      }
    });
    expect((response.data as any).removePermission.error.length).toBe(1);
    expect((response.data as any).removePermission.error[0].message).toEqual(
      noPermissionByName
    );
  });
});
