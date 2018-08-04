import { Context } from "../../../types/graphql-utils";

export default async (args: GQL.ITeamOnQueryArguments, ctx: Context) => {
  return args && args.input && args.input.where && args.input.where.id
    ? ctx.dataloaders.teamById.load(args.input.where.id)
    : null;
};
