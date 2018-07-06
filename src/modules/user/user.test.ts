import { Connection } from "typeorm";
import * as faker from "faker";
import { User } from "../../entity/User";
import { Team } from "../../entity/Team";
import { Permission } from "../../entity/Permission";
import { createTestConn } from "../../testUtils/createTestConn";
import { GrantedPermission } from "../../entity/GrantedPermission";

let conn: Connection;

let user: User;
let team: Team;
let permission: Permission;

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();
const teamName = faker.company.companyName();

beforeAll(async () => {
  conn = await createTestConn();
  user = await User.create({
    email,
    password,
    confirmed: true
  }).save();

  team = await Team.create({
    name: teamName
  }).save();

  permission = await Permission.create({
    name: "CircusPony"
  }).save();

  await GrantedPermission.create({
    user,
    team,
    permission
  }).save();
});
afterAll(async () => {
  conn.close();
});

describe("User Methods", () => {
  test("has team permission", async () => {
    expect(await user.hasTeamPermission(team.id, permission.name)).toEqual(
      true
    );
  });

  test("Does not have nonexistant team permission", async () => {
    // bad permission
    expect(await user.hasTeamPermission(team.id, "fdarewrfdsfa")).toEqual(
      false
    );
    // bad team
    expect(
      await user.hasTeamPermission(faker.random.uuid(), permission.name)
    ).toEqual(false);
  });
});
