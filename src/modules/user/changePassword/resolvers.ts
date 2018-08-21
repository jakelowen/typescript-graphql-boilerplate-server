import { ResolverMap } from "../../../types/graphql-utils";
import changePassword from "./logic/changePassword";

export const resolvers: ResolverMap = {
  Mutation: {
    changePassword(_, args, ctx) {
      return changePassword(args.input, ctx);
    }
  }
};
