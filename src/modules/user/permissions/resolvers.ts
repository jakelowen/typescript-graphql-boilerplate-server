import { ResolverMap } from "../../../types/graphql-utils";
import addPermission from "./logic/addPermission";

export const resolvers: ResolverMap = {
  Mutation: {
    addPermission(_, args, ctx) {
      return addPermission(args.input, ctx);
    }
  }
};
