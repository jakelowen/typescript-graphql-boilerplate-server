import { getConnectionOptions, createConnection } from "typeorm";

export const createTestConn = async (resetDb: boolean = false) => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({
    ...connectionOptions,
    name: "default",
    synchronize: resetDb,
    dropSchema: resetDb
  });
};
