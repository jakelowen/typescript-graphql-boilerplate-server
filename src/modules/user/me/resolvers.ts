// import { map } from "lodash";
import { ResolverMap } from "../../../types/graphql-utils";
import { createMiddleware } from "../../../utils/createMiddleware";
import middleware from "./middleware";
import reformatUserTeamPermissions from "./logic/reformatUserTeamPermissions";
// import reformatUserTeamPermissions from "./logic/reformatUserTeamPermissions";

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, async (_, __, { user, dataloaders }) => {
      if (!user.id) {
        return null;
      }

      return dataloaders.userById.load(user.id);
    })
  },
  User: {
    async teamPermissions(user, _, context, __) {
      const teamPermissions = await context.dataloaders.userTeamPermissionsByUserId.load(
        user.id
      );
      return reformatUserTeamPermissions(teamPermissions);
    }
  }
};
