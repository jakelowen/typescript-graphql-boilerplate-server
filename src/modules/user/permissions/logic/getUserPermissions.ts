import { Context } from "../../../../types/graphql-utils";
import { TeamPermissionReturn } from "../connectors/userPermissionsByUserId";

// const teamPermissions = await context.dataloaders.userTeamPermissionsByUserId.load(
//   user.id
// );
// return reformatUserTeamPermissions(teamPermissions);

export default async (userId: string, ctx: Context) => {
  // db ops
  const rawPermissions = await ctx.dataloaders.userPermissionsByUserId.load(
    userId
  );
  // restructure results
  const results = rawPermissions.map((permission: TeamPermissionReturn) => {
    return {
      id: permission.id,
      team: ctx.dataloaders.teamById.load(permission.teamId),
      name: permission.permission
    };
  });

  return results;
};
