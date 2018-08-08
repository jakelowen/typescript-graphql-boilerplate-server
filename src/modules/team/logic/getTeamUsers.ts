import { Context } from "../../../types/graphql-utils";
import getTeamUsers from "../connectors/getTeamUsers";
import { users } from "../../../types/dbschema";
import primeDataLoader from "../../shared/primeDataLoader";
import getUsersTeamPermissions from "../connectors/getUsersTeamPermissions";
import { some } from "lodash";

export default async (teamId: string, ctx: Context) => {
  const teamUsers = await getTeamUsers(teamId);

  // is requesting user an admin for this team?
  let userIsTeamAdmin = false;
  if (ctx.user.id) {
    const teamPermissions = await getUsersTeamPermissions(teamId, ctx.user.id);
    userIsTeamAdmin = some(teamPermissions, { name: "ADMIN" });
  }

  // prime necessary dataloaders
  teamUsers.map((user: users) => {
    primeDataLoader(ctx.dataloaders.userById, user.id, user);
    primeDataLoader(ctx.dataloaders.userByEmail, user.email, user);
  });

  // if user is not a team admin, obfuscate email address
  if (!userIsTeamAdmin) {
    return teamUsers.map((user: users) => {
      user.email = `${user.email.slice(0, 3)}*********${user.email.slice(-4)}`;
      return user;
    });
  }
  // user is team admin, so go ahead and expose email address
  return teamUsers;
};
