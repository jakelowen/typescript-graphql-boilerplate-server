import db from "../../../../knex";
import { users } from "../../../../types/dbschema";

// load a single user by id
export const userById = async (id: string): Promise<users> =>
  db("users")
    .where({ id })
    .first();

// load users by multiple ids
export const usersFromIds = async (ids: string[]): Promise<users[]> =>
  db("users")
    .whereIn("id", ids)
    .select();
