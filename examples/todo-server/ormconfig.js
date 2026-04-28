module.exports = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  logging: false,
  migrationsTableName: "migrations",
  migrations: [
    "dist/migrations/*.js",
  ],
  cli: {
    migrationsDir: "src/migrations",
  },
};
