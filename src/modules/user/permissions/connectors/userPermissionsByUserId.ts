import db from "../../../../knex";

export interface TeamPermissionReturn {
  id: number;
  permission: string;
  teamId: string;
  userId?: string;
}

// load a single user by id
export const userPermissionsByUserId = async (
  id: string
): Promise<TeamPermissionReturn[]> =>
  db("granted_team_permissions as gtp")
    .leftJoin("permissions as p", "gtp.permissionId", "p.id")
    .where("gtp.userId", "=", id)
    .select("teamId", "p.name as permission", "gtp.id");

// load users by multiple ids
export const userPermissionsByUserIds = async (
  ids: string[]
): Promise<TeamPermissionReturn[]> =>
  db("granted_team_permissions as gtp")
    .leftJoin("permissions as p", "gtp.permissionId", "p.id")
    .whereIn("gtp.userId", ids)
    .select("teamId", "p.name as permission", "gtp.id", "userId");
