import { ResolverMap } from "../../types/graphql-utils";
import { redis } from "../../redis";
import { userSessionIdPrefix, redisSessionPrefix } from "../../constants";

export const resolvers: ResolverMap = {
  Query: {
    dummy3: () => "dummy3"
  },
  Mutation: {
    logout: async (_, __, { session }) => {
      const { userId } = session;
      if (userId) {
        const sessionIds = await redis.lrange(
          `${userSessionIdPrefix}${userId}`,
          0,
          -1
        );

        const rPipeline = redis.multi();
        sessionIds.forEach((key: string) => {
          rPipeline.del(`${redisSessionPrefix}${key}`);
        });
        await rPipeline.exec(err => {
          if (err) {
            console.log(err);
          }
        });
        // console.log(foo);
      }
      return false;
    }
  }
};
