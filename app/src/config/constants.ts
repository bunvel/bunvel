export const MAX_QUERY_LENGTH = 25000; // Safe limit for large schemas (well below PostgreSQL's 1GB limit)
export const MAX_PARAMS_LENGTH = 1000; // Max length for parameters JSON string

export const ALLOWED_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

export const JSON_CONTENT_TYPE = "application/json";

export const CORS_CONFIG = {
  methods: [...ALLOWED_METHODS],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export const LOGGING_CONFIG = {
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "bunvel-api",
  },
  timestamp: "isoTime" as const,
};
