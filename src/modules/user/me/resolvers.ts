import { ResolverMap } from "../../../types/graphql-utils";
import { createMiddleware } from "../../../utils/createMiddleware";
import middleware from "./middleware";

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, async (_, __, { user, dataloaders }) => {
      if (!user.id) {
        return null;
      }

      return dataloaders.userById.load(user.id);
    })
  }
};
