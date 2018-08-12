import db from "../../knex";
import * as faker from "faker";
import { TestClientApollo } from "../../utils/TestClientApollo";
import gql from "graphql-tag";
import * as bcrypt from "bcryptjs";
import beforeEachTruncate from "../../testUtils/beforeEachTruncate";

faker.seed(Date.now() + process.hrtime()[1]);

beforeEach(async () => {
  await beforeEachTruncate();
});

describe("Teams", () => {
  test("multi teams search working", async () => {
    const teams = [
      {
        id: faker.random.uuid(),
        name: `aa_${faker.company.companyName()}`
      },
      {
        id: faker.random.uuid(),
        name: `zz_${faker.company.companyName()}`
      }
    ];

    await db("teams").insert(teams);
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.query({
      query: gql`
        query teams($teamsinput: TeamsInput) {
          teams(input: $teamsinput) {
            items {
              id
              name
            }
          }
        }
      `,
      variables: {
        teamsinput: {
          noCache: true,
          orderBy: [{ sort: "name", direction: "ASC" }]
        }
      }
    });

    expect((response.data as any).teams.items[0].id).toEqual(teams[0].id);
  });

  test("multi teams search working excludes deleted", async () => {
    const teams = [
      {
        id: faker.random.uuid(),
        name: `aa_${faker.company.companyName()}`,
        deletedAt: db.fn.now()
      },
      {
        id: faker.random.uuid(),
        name: `zz_${faker.company.companyName()}`,
        deletedAt: db.fn.now()
      }
    ];

    await db("teams").insert(teams);
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.query({
      query: gql`
        query teams($teamsinput: TeamsInput) {
          teams(input: $teamsinput) {
            items {
              id
              name
            }
          }
        }
      `,
      variables: {
        teamsinput: {
          noCache: true,
          orderBy: [{ sort: "name", direction: "ASC" }]
        }
      }
    });

    expect((response.data as any).teams.items.length).toBe(0);
  });

  test("single team search working", async () => {
    const teams = [
      { id: faker.random.uuid(), name: faker.company.companyName() }
    ];

    await db("teams").insert(teams);
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.query({
      query: gql`
        query team($teaminput: TeamInput) {
          team(input: $teaminput) {
            team {
              id
              name
            }
          }
        }
      `,
      variables: { teaminput: { where: { id: teams[0].id } } }
    });
    expect((response.data as any).team.team.id).toEqual(teams[0].id);
  });

  test("single team search working excludes deleted Teams", async () => {
    const teams = [
      {
        id: faker.random.uuid(),
        name: faker.company.companyName(),
        deletedAt: db.fn.now()
      }
    ];

    await db("teams").insert(teams);
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.query({
      query: gql`
        query team($teaminput: TeamInput) {
          team(input: $teaminput) {
            team {
              id
              name
            }
          }
        }
      `,
      variables: { teaminput: { where: { id: teams[0].id } } }
    });
    expect((response.data as any).team.team).toBeNull();
  });

  test("create Team", async () => {
    const newTeamName = faker.company.companyName();
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);

    const response = await testClient.client.mutate({
      mutation: gql`
        mutation createTeam($input: CreateTeamInput!) {
          createTeam(input: $input) {
            team {
              id
              name
            }
          }
        }
      `,
      variables: { input: { name: newTeamName } }
    });
    expect((response.data as any).createTeam.team.name).toEqual(newTeamName);
  });

  test("update Team", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };

    await db("teams").insert(team);
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const newTeamName = "ChangedTeamName";
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation updateTeam($input: UpdateTeamInput!) {
          updateTeam(input: $input) {
            team {
              id
              name
            }
          }
        }
      `,
      variables: { input: { name: newTeamName, id: team.id } }
    });
    expect((response.data as any).updateTeam.team.name).toEqual(newTeamName);
    expect((response.data as any).updateTeam.team.id).toEqual(team.id);
  });

  test("delete Team", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };

    await db("teams").insert(team);
    const testClient = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await testClient.client.mutate({
      mutation: gql`
        mutation deleteTeam($input: DeleteTeamInput!) {
          deleteTeam(input: $input) {
            team {
              id
              name
            }
          }
        }
      `,
      variables: { input: { id: team.id } }
    });
    expect((response.data as any).deleteTeam.team.id).toEqual(team.id);
    const dbTeam = await db("teams")
      .where({ id: team.id })
      .first();
    expect(dbTeam.deletedAt).not.toBeFalsy();
  });

  test("non admins get obfuscated email addresses", async () => {
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
  });

  test("Admins get non-obfuscated email addresses", async () => {
    const team = { id: faker.random.uuid(), name: faker.company.companyName() };
    const password = faker.internet.password();
    const user = {
      email: faker.internet.email(),
      password: await bcrypt.hash(password, 10),
      id: faker.random.uuid(),
      confirmed: true
    };

    const permission = { id: faker.random.number(), name: "ADMIN" };
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

    // login
    await testClient.login(user.email, password);

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
    expect((response.data as any).team.team.users[0].email).toEqual(user.email);
  });
});
