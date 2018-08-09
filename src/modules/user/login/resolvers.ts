import { ResolverMap } from "../../../types/graphql-utils";
import login from "./logic/login";

export const resolvers: ResolverMap = {
  Mutation: {
    async login(_, args, ctx) {
      return login(args.input, ctx);
    }
  }
};
