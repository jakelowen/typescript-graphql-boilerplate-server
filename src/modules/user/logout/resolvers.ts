import { ResolverMap } from "../../../types/graphql-utils";
import User from "../../../models/User";

export const resolvers: ResolverMap = {
  Mutation: {
    logout: async (_, __, { user }) => User.invalidateUserTokens(user.id)
  }
};
