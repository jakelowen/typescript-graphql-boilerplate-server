import { Redis } from "ioredis";
import { forgotPasswordPrefix } from "../../../../constants";

export default async (key: string, redis: Redis) => {
  const redisKey = `${forgotPasswordPrefix}${key}`;
  return redis.del(redisKey);
};
