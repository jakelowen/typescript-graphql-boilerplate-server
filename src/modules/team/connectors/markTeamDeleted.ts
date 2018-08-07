import db from "../../../knex";
import { teams } from "../../../types/dbschema";

export default async (id: string): Promise<teams> => {
  console.log("id", id);
  const deletedTeam = await db("teams")
    .update({ deletedAt: db.fn.now() })
    .where({ id })
    .returning("*");

  return deletedTeam[0];
};
