import { ResolverMap } from "../../../types/graphql-utils";
import updateProfile from "./logic/updateProfile";

export const resolvers: ResolverMap = {
  Mutation: {
    updateProfile(_, args, ctx) {
      return updateProfile(args.input, ctx);
    }
  }
};
