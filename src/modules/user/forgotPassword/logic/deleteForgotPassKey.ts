import { Redis } from "../../../../../node_modules/@types/ioredis";
import { forgotPasswordPrefix } from "../../../../constants";

export default async (key: string, redis: Redis) => {
  const redisKey = `${forgotPasswordPrefix}${key}`;
  return redis.del(redisKey);
};
