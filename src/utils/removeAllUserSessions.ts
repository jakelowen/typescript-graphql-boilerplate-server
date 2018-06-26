import { Redis } from "ioredis";

import { userSessionIdPrefix, redisSessionPrefix } from "../constants";

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
  await rPipeline.exec(err => {
    if (err) {
      console.log(err);
    }
  });
};
