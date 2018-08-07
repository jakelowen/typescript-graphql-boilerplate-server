import { pick } from "lodash";
// import { teams } from "../../../types/dbschema";
import primeDataLoader from "../../shared/primeDataLoader";
import { Context } from "../../../types/graphql-utils";
import updateTeam from "../connectors/updateTeam";

export default async (input: GQL.IUpdateTeamInput, ctx: Context) => {
  // pluck fields
  const writeFields = pick(input, ["name"]);
  // db op
  const updatedTeam = await updateTeam(
    writeFields as { name: string },
    input.id
  );
  // cache & return
  return {
    team: await primeDataLoader(
      ctx.dataloaders.teamById,
      updatedTeam.id,
      updatedTeam
    )
  };
};
