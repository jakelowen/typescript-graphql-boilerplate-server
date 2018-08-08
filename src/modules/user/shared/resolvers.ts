// import { map } from "lodash";
import { ResolverMap } from "../../../types/graphql-utils";
import getUserPermissions from "../permissions/logic/getUserPermissions";
// import { createMiddleware } from "../../../utils/createMiddleware";
// import middleware from "./middleware";
// import reformatUserTeamPermissions from "./logic/reformatUserTeamPermissions";
// import reformatUserTeamPermissions from "./logic/reformatUserTeamPermissions";

export const resolvers: ResolverMap = {
  User: {
    async permissions(user, _, ctx, ___) {
      return getUserPermissions(user.id, ctx);
    }
  }
};
