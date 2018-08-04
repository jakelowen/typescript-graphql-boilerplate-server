import db from "../../../knex";
import { teams } from "../../../types/dbschema";

// load a single team by id
export const teamById = async (id: string): Promise<teams> =>
  db("teams")
    .where({ id })
    .first();

// load teams by multiple ids
export const teamsFromIds = async (ids: string[]): Promise<teams[]> =>
  db("teams")
    .whereIn("id", ids)
    .select();
