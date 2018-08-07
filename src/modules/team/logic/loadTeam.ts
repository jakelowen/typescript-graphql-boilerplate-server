import { Context } from "../../../types/graphql-utils";

export default async (args: GQL.ITeamOnQueryArguments, ctx: Context) => {
  const team =
    args && args.input && args.input.where && args.input.where.id
      ? await ctx.dataloaders.teamById.load(args.input.where.id)
      : null;

  return team && team.deletedAt === null ? team : null;
};
