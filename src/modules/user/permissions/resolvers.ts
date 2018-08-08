import { ResolverMap } from "../../../types/graphql-utils";
import addPermission from "./logic/addPermission";
import removePermission from "./logic/removePermission";

export const resolvers: ResolverMap = {
  Mutation: {
    addPermission(_, args, ctx) {
      return addPermission(args.input, ctx);
    },
    removePermission(_, args, ctx) {
      return removePermission(args.input, ctx);
    }
  }
};
