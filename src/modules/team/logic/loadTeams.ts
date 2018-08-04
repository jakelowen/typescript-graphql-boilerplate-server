import generateDeterministicCacheId from "../../shared/pagination/logic/generateDeterministicCacheId";
import { Context } from "../../../types/graphql-utils";
import primeDataLoader from "../../shared/primeDataLoader";
import { teams } from "../../../types/dbschema";

export default async (args: GQL.ITeamsOnQueryArguments, ctx: Context) => {
  // fetch page
  const data = await ctx.dataloaders.pageLoader.load(
    generateDeterministicCacheId({
      table: {
        name: "teams",
        uniqueColumn: "id"
      },
      ttl: 120,
      ...args.input
    })
  );
  // prime necessary dataloaders
  if (data && data.items) {
    data.items.map((item: teams) =>
      primeDataLoader(ctx.dataloaders.teamById, item.id, item)
    );
  }
  return data;
};
