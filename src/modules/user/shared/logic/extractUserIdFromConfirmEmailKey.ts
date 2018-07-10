import { Redis } from "../../../../../node_modules/@types/ioredis";

export default async (id: string, redis: Redis) => {
  return redis.get(id);
};
