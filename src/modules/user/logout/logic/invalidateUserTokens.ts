import { Redis } from "../../../../../node_modules/@types/ioredis";
import { userTokenVersionPrefix } from "../../../../constants";

export default async (userId: string, redis: Redis) => {
  if (!userId) {
    return null;
  }
  return redis.incr(`${userTokenVersionPrefix}${userId}`);
};
