import { Context } from "../../../../types/graphql-utils";
import {
  noPermissionByName,
  noTeamExists,
  noUserExists,
  duplicatePermission,
  notTeamAdminError
} from "./errors";
import addPermission from "../connectors/addPermission";
// import { TeamPermissionReturn } from "../connectors/userPermissionsByUserId";
import { filter, some } from "lodash";
// import getUsersTeamPermissions from "../../../team/connectors/getUsersTeamPermissions";

export default async (
  input: {
    permissionName: string;
    teamId: string;
    userId: string;
  },
  ctx: Context
) => {
  const { permissionName, teamId, userId } = input;

  // coerce name into upper case and trimmed
  const upperName = permissionName.toUpperCase().trim();

  // check to see if permission by that name exists, get id return error if not
  const existingPerm = await ctx.dataloaders.permissionByName.load(upperName);

  if (!existingPerm) {
    return { error: [{ path: "addPermission", message: noPermissionByName }] };
  }

  // check to make sure that team exists, get id, return error if not
  const existingTeam = await ctx.dataloaders.teamById.load(teamId);
  if (!existingTeam) {
    return { error: [{ path: "addPermission", message: noTeamExists }] };
  }

  // check to make sure that user exists, get id, return error if not
  const existingUser = await ctx.dataloaders.userById.load(userId);
  if (!existingUser) {
    return { error: [{ path: "addPermission", message: noUserExists }] };
  }

  // check if user already has this permission
  const existingUserPermissions = await ctx.dataloaders.userPermissionsByUserId.load(
    userId
  );
  const duplicatePermissions = filter(existingUserPermissions, {
    permission: permissionName,
    teamId,
    userId
  });
  // console.log("DUP", duplicatePermissions);
  if (duplicatePermissions.length > 0) {
    return { error: [{ path: "addPermission", message: duplicatePermission }] };
  }

  // see if user is team admin, reject if not.
  // is requesting user an admin for this team?
  let userIsTeamAdmin = false;
  if (ctx.user.id) {
    const existingRequesterPermissions = await ctx.dataloaders.userPermissionsByUserId.load(
      ctx.user.id
    );
    userIsTeamAdmin = some(existingRequesterPermissions, {
      permission: "ADMIN",
      teamId,
      userId: ctx.user.id
    });
  }

  if (!userIsTeamAdmin) {
    return { error: [{ path: "addPermission", message: notTeamAdminError }] };
  }

  // create permission db op
  const newPermission = await addPermission(teamId, userId, existingPerm.id);

  // need to cache?

  // return
  return {
    permission: {
      id: newPermission[0].id,
      name: existingPerm.name,
      team: existingTeam
    }
  };
};
