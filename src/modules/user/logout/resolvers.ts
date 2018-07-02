import { ResolverMap } from "../../../types/graphql-utils";
// import { redis } from "../../../redis";
// import { removeAllUserSessions } from "../../../utils/removeAllUserSessions";
import { userTokenVersionPrefix } from "../../../constants";

export const resolvers: ResolverMap = {
  Mutation: {
    logout: async (_, __, { user, redis }) => {
      await redis.incr(`${userTokenVersionPrefix}${user.id}`);
    }
  }
};
