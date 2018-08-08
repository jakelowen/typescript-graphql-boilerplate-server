import db from "../../../knex";
import { permissions } from "../../../types/dbschema";

export default async (
  teamId: string,
  userId: string
): Promise<[permissions]> => {
  return db("granted_team_permissions")
    .join("users", "users.id", "=", "granted_team_permissions.userId")
    .join(
      "permissions",
      "permissions.id",
      "=",
      "granted_team_permissions.permissionId"
    )
    .where("granted_team_permissions.teamId", "=", teamId)
    .where("granted_team_permissions.userId", "=", userId)
    .select("permissions.name");
};
