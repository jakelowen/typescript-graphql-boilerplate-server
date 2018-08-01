import * as jwt from "jsonwebtoken";
import * as faker from "faker";
import * as bcrypt from "bcryptjs";

import db from "../../../knex";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import { redis } from "../../../redis";
import { userTokenVersionPrefix } from "../../../constants";
import { teams } from "../../../types/dbschema";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;

beforeAll(async () => {
  const user = await db("users")
    .insert({
      email,
      password: await bcrypt.hash(password, 10),
      confirmed: true
    })
    .returning("*");
  userId = user[0].id;
});

describe("me", () => {
  test.only("return null if no valid token", async () => {
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });

  test("get current user", async () => {
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    await client.login(email, password);
    const responseMe = (await client.me()) as any;
    expect(responseMe.data.me.email).toEqual(email);
    expect(responseMe.data.me.id).toEqual(userId);
  });

  test("me is null if version mismatch", async () => {
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    // attach a fake token with random number version so there is version mismatch
    client.token = jwt.sign(
      { id: userId, version: faker.random.number },
      process.env.JWT_SECRET as any,
      { expiresIn: "24h" }
    );
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });

  test("me is null if token expired", async () => {
    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    // update redis store to force version number equality.
    const tokenVersion = faker.random.number();
    await redis.set(`${userTokenVersionPrefix}${userId}`, tokenVersion);
    // create expired token
    client.token = jwt.sign(
      {
        id: userId,
        version: tokenVersion,
        exp: Math.floor(Date.now() / 1000) - 3000
      },
      process.env.JWT_SECRET as any
    );
    const response = (await client.me()) as any;
    expect(response.data.me).toBeNull();
  });

  test("permissions test", async () => {
    const team: teams[] = await db("teams")
      .insert({ name: "fooTeam" })
      .returning("*");
    const permission = await db("permissions")
      .insert([{ name: "User" }])
      .returning("*");
    await db("granted_team_permissions").insert([
      {
        teamId: team[0].id,
        userId,
        permissionId: permission[0].id
      }
    ]);

    const url = process.env.TEST_HOST as string;
    const client = new TestClientApollo(url);
    await client.login(email, password);
    const responseMe = (await client.meWithTeamPermissions()) as any;
    expect(responseMe.data.me.teamPermissions).toHaveLength(1);
    expect(responseMe.data.me.teamPermissions[0].team).toEqual(team[0].id);
    expect(responseMe.data.me.teamPermissions[0].permissions).toContain("User");
    expect(responseMe.data.me.teamPermissions[0].permissions).not.toContain(
      "Admin"
    );
  });
});
