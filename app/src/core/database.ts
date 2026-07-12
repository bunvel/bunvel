import { SQL } from "bun";
import { env } from "../config/env";

export const db = new SQL({
  url: env.DATABASE_URL,
  max: 10,
  connectionTimeout: 2000,
  idleTimeout: 30000,
  maxLifetime: 600000,
});