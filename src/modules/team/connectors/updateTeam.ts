import db from "../../../knex";
import { teams } from "../../../types/dbschema";

export default async (data: { name: string }, id: string): Promise<teams> => {
  const updatedTeam = await db("teams")
    .update(data)
    .where({ id })
    .returning("*");

  return updatedTeam[0];
};
