import primeDataLoader from "../../shared/primeDataLoader";
import { Context } from "../../../types/graphql-utils";
import markTeamDeleted from "../connectors/markTeamDeleted";

export default async (input: GQL.IDeleteTeamInput, ctx: Context) => {
  // db op
  const deletedTeam = await markTeamDeleted(input.id);
  // cache & return
  return {
    team: await primeDataLoader(
      ctx.dataloaders.teamById,
      deletedTeam.id,
      deletedTeam
    )
  };
};
