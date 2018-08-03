import { ResolverMap } from "../../types/graphql-utils";
import generateDeterministicCacheId from "../shared/pagination/generateDeterministicCacheId";

export const resolvers: ResolverMap = {
  Mutation: {
    createTeam(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    },
    updateTeam(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    },
    deleteTeam(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    }
  },
  Query: {
    team(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    },
    async teams(_, args, ctx) {
      const payload = {
        table: {
          name: "teams",
          uniqueColumn: "id"
        },
        ...args.input
      };
      const foo = await ctx.dataloaders.pageLoader.load(
        generateDeterministicCacheId(payload)
      );
      return foo;
    }
  }
};
