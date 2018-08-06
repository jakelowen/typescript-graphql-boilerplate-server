import db from "../../../knex";
import { teams } from "../../../types/dbschema";

export default async (data: { name: string }): Promise<teams> => {
  const newTeams = await db("teams")
    .insert(data)
    .returning("*");

  return newTeams[0];
};
