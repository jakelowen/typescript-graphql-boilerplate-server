import { v4 } from "uuid";
import { Redis } from "../../../../../node_modules/@types/ioredis";
import { forgotPasswordPrefix } from "../../../../constants";

export default async (userId: string, redis: Redis) => {
  const id = v4();
  const url = process.env.FRONTEND_HOST as string;
  await redis.set(`${forgotPasswordPrefix}${id}`, userId, "ex", 60 * 20);
  return `${url}/change-password/${id}`;
};
