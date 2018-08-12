import db from "../knex";
import { redis } from "../redis";

export default async () => {
  await db.raw("TRUNCATE TABLE granted_team_permissions");
  await db.raw("TRUNCATE TABLE permissions CASCADE");
  await db.raw("TRUNCATE TABLE teams CASCADE");
  await db.raw("TRUNCATE TABLE users CASCADE");
  await redis.flushall();
};
