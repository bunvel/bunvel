import { SQL } from "bun";
import { env } from "../utils/config";

const connectionString = `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@postgres:5432/${env.POSTGRES_DB}`;

// Update database configuration
export const db = new SQL(connectionString, {
  max: 20,
  connectionTimeout: 2000,
  idleTimeout: 30000,
  maxLifetime: 600000,
});