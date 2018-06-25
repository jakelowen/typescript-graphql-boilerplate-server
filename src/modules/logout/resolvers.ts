import { ResolverMap } from "../../types/graphql-utils";
import { redis } from "../../redis";
import { removeAllUserSessions } from "../../utils/removeAllUserSessions";

export const resolvers: ResolverMap = {
  Query: {
    dummy3: () => "dummy3"
  },
  Mutation: {
    logout: async (_, __, { session }) => {
      const { userId } = session;
      if (userId) {
        await removeAllUserSessions(userId, redis);
        return true;
      }
      return false;
    }
  }
};
