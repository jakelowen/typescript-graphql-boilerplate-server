import { ResolverMap } from "../../../types/graphql-utils";
import { redis } from "../../../redis";
import { removeAllUserSessions } from "../../../utils/removeAllUserSessions";

export const resolvers: ResolverMap = {
  Mutation: {
    logout: async (_, __, { session }) => {
      const { userId } = session;
      if (userId) {
        await removeAllUserSessions(userId, redis);
        session.destroy(err => {
          if (err) {
            console.log(err);
          }
        });
        return true;
      }
      return false;
    }
  }
};
