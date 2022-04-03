const config = {
  mysqlConfig: {
    host: process.env.DATABASE_HOST || "",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "",
  },
};

export default config;
