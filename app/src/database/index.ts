import { SQL } from "bun";
import { env } from "../utils/config";

export const db = new SQL({
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  hostname: "postgres",
  port: 5432,
  database: env.POSTGRES_DB,
  max: 10,
  connectionTimeout: 2000,
  idleTimeout: 30000,
  maxLifetime: 600000,
});