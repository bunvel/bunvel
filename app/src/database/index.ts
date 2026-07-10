import { SQL } from "bun";
import { env } from "../utils/config";

export const db = new SQL({
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  hostname: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  max: 10,
  connectionTimeout: 2000,
  idleTimeout: 30000,
  maxLifetime: 600000,
});