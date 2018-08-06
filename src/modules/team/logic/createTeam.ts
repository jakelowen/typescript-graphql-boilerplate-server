import { pick } from "lodash";
import createTeam from "../connectors/createTeam";
// import { teams } from "../../../types/dbschema";
import primeDataLoader from "../../shared/primeDataLoader";
import { Context } from "../../../types/graphql-utils";

export default async (input: GQL.ICreateTeamInput, ctx: Context) => {
  // pluck fields
  const writeFields = pick(input, ["name"]);
  // db op
  const newTeam = await createTeam(writeFields);
  // cache & return
  return {
    team: await primeDataLoader(ctx.dataloaders.teamById, newTeam.id, newTeam)
  };
};
