import { z } from "zod";

// Define environment variable schema with validation rules
const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8000),

  // Default Project
  DEFAULT_ORGANIZATION: z.string().default("Default Organization"),
  DEFAULT_PROJECT: z.string().default("Default Project"),

  // Database
  DATABASE_URL: z.string().url("Invalid DATABASE_URL format"),

  // PostgREST
  POSTGREST_URL: z.string().url("Invalid PostgREST URL format").default("http://rest:8001"),

  // Frontend
  VITE_BUNVEL_STUDIO_URL: z.string().url("Invalid VITE_BUNVEL_STUDIO_URL format").optional(),
  VITE_API_URL: z.string().url("Invalid VITE_API_URL format").optional(),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("Invalid BETTER_AUTH_URL format"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").optional(),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters").optional(),
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
