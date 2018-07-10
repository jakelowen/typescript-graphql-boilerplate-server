import { forgotPasswordPrefix } from "../../../../constants";
import { Redis } from "../../../../../node_modules/@types/ioredis";

export default async (key: string, redis: Redis): Promise<string> => {
  const redisKey = `${forgotPasswordPrefix}${key}`;
  return redis.get(redisKey);
};
