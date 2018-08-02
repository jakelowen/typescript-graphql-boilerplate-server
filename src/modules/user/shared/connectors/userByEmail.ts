import db from "../../../../knex";
import { users } from "../../../../types/dbschema";

// load a single user by id
export const userByEmail = async (email: string): Promise<users> =>
  db("users")
    .where({ email })
    .first();

// load users by multiple ids
export const usersFromEmails = async (emails: string[]): Promise<users[]> =>
  db("users")
    .whereIn("email", emails)
    .select();
