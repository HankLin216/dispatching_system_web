import { getConnection, createConnection, Connection, getMetadataArgsStorage } from "typeorm";

const host = process.env.DATABASE_HOST || "";
const port = Number(process.env.DATABASE_PORT) || 3306;
const username = process.env.DATABASE_USERNAME || "";
const password = process.env.DATABASE_PASSWORD || "";
const database = process.env.DATABASE_NAME || "";

let connectionReadyPromise: Promise<Connection> | null = null;

export const prepareConnection = () => {
  if (!connectionReadyPromise) {
    connectionReadyPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = getConnection();
        await staleConnection.close();
      } catch (error) {
        // no stale connection to clean up
      }

      // wait for new default connection
      const connection = await createConnection({
        type: "mysql",
        host,
        port,
        username,
        password,
        database,
        entities: getMetadataArgsStorage().tables.map((tb) => tb.target),
        synchronize: false,
        logging: true,
      });

      return connection;
    })();
  }

  return connectionReadyPromise;
};
