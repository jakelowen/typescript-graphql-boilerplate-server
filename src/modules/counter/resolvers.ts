import { RedisPubSub } from "graphql-redis-subscriptions";

export const resolvers: any = {
  Subscription: {
    counter: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: RedisPubSub }) =>
        // context: any
        {
          const channel = Math.random()
            .toString(36)
            .substring(2, 15); // random channel name
          let count = 0;
          setInterval(
            () =>
              pubsub.publish(channel, {
                counter: { count: count++ }
              }),
            2000
          );
          return pubsub.asyncIterator(channel);
        }
    }
  }
};
