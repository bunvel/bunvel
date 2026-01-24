import { z } from "zod";

// Define environment variable schema with validation rules
const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8000),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  // Database
  POSTGRES_USER: z.string().min(1, "POSTGRES_USER is required"),
  POSTGRES_PASSWORD: z.string().min(1, "POSTGRES_PASSWORD is required"),
  POSTGRES_DB: z.string().min(1, "POSTGRES_DB is required"),

  // PostgREST
  POSTGREST_URL: z.url("Invalid PostgREST URL format"),

  // Studio
  VITE_BUNVEL_STUDIO_URL: z.url("Invalid VITE_BUNVEL_STUDIO_URL format"),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
});

type EnvConfig = z.infer<typeof envSchema>;

// Validate environment variables
const _env = envSchema.safeParse(Bun.env);

if (!_env.success) {
  const errorMessages = _env.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `- ${path}: ${issue.message}`;
  });

  console.error("❌ Invalid environment variables:");
  console.error(errorMessages.join("\n"));
  process.exit(1);
}

export const env = _env.data as EnvConfig;
