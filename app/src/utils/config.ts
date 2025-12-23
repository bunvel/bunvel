import { z } from 'zod';

// Define environment variable schema with validation rules
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  // Database
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),
  
  // Redis
  REDIS_URL: z.url('Invalid Redis URL format'),
  
  // PostgREST
  POSTGREST_URL: z.url('Invalid PostgREST URL format'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().transform(origins => 
    origins.split(',').map(origin => origin.trim())
  ),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
});

type EnvConfig = z.infer<typeof envSchema>;

// Validate environment variables
const _env = envSchema.safeParse(Bun.env);

if (!_env.success) {
  const errorMessages = _env.error.issues.map(issue => {
    const path = issue.path.join('.');
    return `- ${path}: ${issue.message}`;
  });
  
  console.error('❌ Invalid environment variables:');
  console.error(errorMessages.join('\n'));
  process.exit(1);
}

export const env = _env.data as EnvConfig;

// Log environment info on startup
if (env.NODE_ENV !== 'test') {
  console.log(`🚀 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Server will run on port: ${env.PORT}`);
  console.log(`🔒 JWT enabled with expiration: ${env.JWT_EXPIRES_IN}`);
  console.log(`🔄 JWT refresh enabled with expiration: ${env.JWT_REFRESH_EXPIRES_IN}`);
  console.log(`🌍 Allowed origins: ${env.ALLOWED_ORIGINS.join(', ')}`);
  console.log(`⏱️  Rate limiting: ${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
}
