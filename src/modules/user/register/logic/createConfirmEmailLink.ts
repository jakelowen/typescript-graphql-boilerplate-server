import { v4 } from "uuid";

import { Redis } from "../../../../../node_modules/@types/ioredis";

export default async (url: string, userId: string, redis: Redis) => {
  const id = v4();
  await redis.set(id, userId, "ex", 60 * 60 * 24);
  return `${url}/confirm/${id}`;
};
