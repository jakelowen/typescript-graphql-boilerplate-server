import db from "../../../../knex";
import { granted_permissions } from "../../../../types/dbschema";

export default async (
  teamId: string,
  userId: string,
  permissionId: number
): Promise<granted_permissions[]> =>
  db("granted_team_permissions")
    .insert({
      userId,
      permissionId,
      teamId
    })
    .returning("*");
