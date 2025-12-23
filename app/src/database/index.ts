import { SQL } from "bun";
import { env } from "../utils/config";

const connectionString = env.DATABASE_URL_SERVICE!;
const isProduction = env.NODE_ENV === 'production';

// Update database configuration
export const db = new SQL(connectionString, {
  // Connection pool settings
  max: 20, // Maximum number of connections
  // Enable SSL in production
  tls: isProduction ? { 
    rejectUnauthorized: true 
  } : false,
  connectionTimeout: 2000,
  idleTimeout: 30000,
  maxLifetime: 600000,
});