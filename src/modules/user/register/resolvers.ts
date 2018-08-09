import { ResolverMap } from "../../../types/graphql-utils";
import register from "./logic/register";

export const resolvers: ResolverMap = {
  Mutation: {
    async register(_, args, ctx) {
      return register(args.input, ctx);
    }
  }
};
