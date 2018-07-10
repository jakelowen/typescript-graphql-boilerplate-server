import { ResolverMap } from "../../../types/graphql-utils";
import invalidateUserTokens from "./logic/invalidateUserTokens";

export const resolvers: ResolverMap = {
  Mutation: {
    logout: async (_, __, { user, redis }) =>
      invalidateUserTokens(user.id, redis)
  }
};
