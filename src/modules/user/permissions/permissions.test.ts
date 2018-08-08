// import generateDeterministicCacheId from "./generateDeterministicCacheId";
// import decodeDeterministicCacheId from "./decodeDeterministicCacheId";
import db from "../../../knex";
// import loadSinglePage from "./loadSinglePage";
import * as faker from "faker";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import gql from "graphql-tag";
import * as bcrypt from "bcryptjs";

// import { redis } from "../../redis";

faker.seed(Date.now() + process.hrtime()[1]);

// beforeEach(async () =>
//   Promise.all([db.raw("TRUNCATE TABLE teams CASCADE"), redis.flushall()]));

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
