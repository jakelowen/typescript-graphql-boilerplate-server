import { Redis } from "ioredis";
import { userTokenVersionPrefix } from "../../../../constants";

export default async (id: string, redis: Redis): Promise<string> => {
  let tokenVersion = await redis.get(`${userTokenVersionPrefix}${id}`);

  if (!tokenVersion) {
    await redis.set(`${userTokenVersionPrefix}${id}`, 1);
    tokenVersion = "1";
  }
  return tokenVersion;
};
