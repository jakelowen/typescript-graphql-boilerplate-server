import { Redis } from "ioredis";

import {
  userSessionIdPrefix,
  redisSessionPrefix,
  userSubscriptionTokenLookupPrefix
} from "../constants";

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  );

  const rPipeline = redis.multi();
  sessionIds.forEach((key: string) => {
    rPipeline.del(`${redisSessionPrefix}${key}`);
  });

  rPipeline.del(`${userSubscriptionTokenLookupPrefix}${userId}`);

  // const subscriptionTokenIds = await redis.lrange(
  //   `${userSubscriptionTokensPrefix}${userId}`,
  //   0,
  //   -1
  // );

  // subscriptionTokenIds.forEach((key: string) => {
  //   rPipeline.del(`${userSubscriptionTokenPrefix}${key}`);
  // });

  await rPipeline.exec(err => {
    if (err) {
      console.log(err);
    }
  });
};
