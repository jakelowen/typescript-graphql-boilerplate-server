import db from "../../../../knex";
import { permissions } from "../../../../types/dbschema";

// load a single user by id
export const permissionByName = async (name: string): Promise<permissions[]> =>
  db("permissions")
    .where("name", "=", name)
    .select();

// load users by multiple ids
export const permissionsByNames = async (
  names: string[]
): Promise<permissions[]> =>
  db("permissions")
    .whereIn("name", names)
    .select();
