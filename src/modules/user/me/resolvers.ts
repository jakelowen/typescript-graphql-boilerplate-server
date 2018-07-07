import { ResolverMap } from "../../../types/graphql-utils";
import User from "../../../models/User";
import { createMiddleware } from "../../../utils/createMiddleware";
import middleware from "./middleware";

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, async (_, __, { user }) => {
      if (!user.id) {
        return null;
      }
      return User.query()
        .where({ id: user.id })
        .first();
    })
  }
};
