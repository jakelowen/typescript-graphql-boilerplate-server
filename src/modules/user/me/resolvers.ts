import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { createMiddleware } from "../../../utils/createMiddleware";
import middleware from "./middleware";
import { userSubscriptionTokenLookupPrefix } from "../../../constants";
import { redis } from "../../../redis";
// import { redis } from "../../../redis";

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, async (_, __, { user }) => {
      console.log("!!!! user", user);
      const userDb = await User.findOne({ where: { id: user.id } });
      if (userDb) {
        const subscriptionToken = await redis.get(
          `${userSubscriptionTokenLookupPrefix}${userDb.id}`
        );
        return { ...user, subscriptionToken };
      }
      return null;
    })
  }
};
