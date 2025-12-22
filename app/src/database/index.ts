import { SQL } from "bun";

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL_SERVICE',
  'NODE_ENV'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const connectionString = process.env.DATABASE_URL_SERVICE!;
const isProduction = process.env.NODE_ENV === 'production';

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

// Test the database connection on startup
async function testConnection() {
  try {
    await db`SELECT 1`;
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
}

testConnection().catch(console.error);