import db from "../../../knex";
import { users } from "../../../types/dbschema";

export default async (teamId: string): Promise<[users]> => {
  return db("granted_team_permissions")
    .join("users", "users.id", "=", "granted_team_permissions.userId")
    .select("users.*")
    .where("granted_team_permissions.teamId", "=", teamId);
};
