import { startServer } from "../startServer";
import db from "../knex";

export const setup = async () => {
  await db.migrate.latest({ directory: "src/migrations" });
  await db.raw("TRUNCATE TABLE granted_team_permissions");
  await db.raw("TRUNCATE TABLE permissions CASCADE");
  await db.raw("TRUNCATE TABLE teams CASCADE");
  await db.raw("TRUNCATE TABLE users CASCADE");
  const app = await startServer();
  const { port }: any = app.address();
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;
  process.env.TEST_HOST_WS = `ws://127.0.0.1:${port}`;
};
