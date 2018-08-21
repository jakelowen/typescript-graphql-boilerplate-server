import db from "../../../../knex";
import { users } from "../../../../types/dbschema";

// load a single user by id
export default async (id: string, data: UpdateData): Promise<users[]> =>
  db("users")
    .update(data)
    .where({ id })
    .returning("*");
