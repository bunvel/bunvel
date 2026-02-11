import { Elysia } from "elysia";
import pino from "pino";
import { env } from "../utils/config";
import { LOGGING_CONFIG } from "../utils/constant";

// Create base Pino logger with environment-specific configuration
export const logger = pino({
  level: LOGGING_CONFIG.level,
  base: LOGGING_CONFIG.base,
  timestamp: pino.stdTimeFunctions[LOGGING_CONFIG.timestamp],
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => {
      // Add timestamp if not present
      if (!object.time) {
        object.time = new Date().toISOString();
      }
      return object;
    },
  },
  // In development, use pretty printing
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  // In production, use JSON format for better log aggregation
  serializers:
    env.NODE_ENV !== "development"
      ? {
          // Add any serializers here if needed in production
        }
      : undefined,
});

export const queryLogger = logger.child({
  service: "bunvel-queries",
  component: "database",
});

export const errorLogger = logger.child({
  service: "bunvel-errors",
  component: "error-handling",
});

export const httpLogger = logger.child({
  service: "bunvel-http",
  component: "request-handling",
});

// Utility methods for consistent logging patterns
export const loggers = {
  service: (serviceName: string) =>
    logger.child({ service: serviceName, component: "service" }),
  plugin: (pluginName: string) =>
    logger.child({ service: `bunvel-${pluginName}`, component: "plugin" }),
  middleware: (middlewareName: string) =>
    logger.child({
      service: `bunvel-${middlewareName}`,
      component: "middleware",
    }),
};

export const loggingPlugin = new Elysia({ name: "logging" })

  .onRequest(({ request, set }) => {
    const start = Date.now();
    const correlationId = Bun.randomUUIDv7();

    set.headers["x-request-start"] = start.toString();
    set.headers["x-correlation-id"] = correlationId;
  })

  .onAfterHandle(({ request, set }) => {
    const start = parseInt(String(set.headers["x-request-start"] || "0"));
    const duration = Date.now() - start;
    const correlationId = set.headers["x-correlation-id"] as string;

    // Extract path without query params for cleaner logs
    const url = new URL(request.url);
    const path = url.pathname;
    const query = url.search;

    // Sanitize user agent (remove potential sensitive info)
    const userAgent =
      request.headers.get("user-agent")?.slice(0, 200) || "unknown";

    // Sanitize IP (show only first 2 octets in production)
    const rawIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ip =
      env.NODE_ENV === "production"
        ? rawIp.split(".").slice(0, 2).join(".") + ".x.x"
        : rawIp;

    // Single wide event per request (Laravel-style)
    const statusCode = Number(set.status ?? 200);
    const wideEvent = {
      event: "http.request",
      correlationId,
      method: request.method,
      path,
      query: query || undefined,
      statusCode,
      duration,
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
      // Environment context
      service: "bunvel-api",
      version: process.env.npm_package_version || "0.0.0",
      nodeEnv: env.NODE_ENV,
    };

    // Use info level for successful requests, error for failures
    const logLevel = statusCode >= 400 ? "error" : "info";
    httpLogger[logLevel](wideEvent);
  })

  .onError(({ error, request, set }) => {
    const start = parseInt(String(set.headers["x-request-start"] || "0"));
    const duration = Date.now() - start;
    const correlationId = set.headers["x-correlation-id"] as string;

    // Extract path without query params for cleaner logs
    const url = new URL(request.url);
    const path = url.pathname;
    const query = url.search;

    // Sanitize user agent
    const userAgent =
      request.headers.get("user-agent")?.slice(0, 200) || "unknown";

    // Sanitize IP
    const rawIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ip =
      env.NODE_ENV === "production"
        ? rawIp.split(".").slice(0, 2).join(".") + ".x.x"
        : rawIp;

    // Sanitize error details (no stack traces in production logs)
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error);

    // Single wide event for errors (Laravel-style)
    const wideEvent = {
      event: "http.request",
      correlationId,
      method: request.method,
      path,
      query: query || undefined,
      statusCode: Number(set.status ?? 500),
      duration,
      userAgent,
      ip,
      error: {
        message: errorMessage,
        type:
          error && typeof error === "object" && "name" in error
            ? String(error.name)
            : "Error",
        // Include stack only in development
        ...(env.NODE_ENV === "development" &&
        error &&
        typeof error === "object" &&
        "stack" in error
          ? { stack: String(error.stack) }
          : {}),
      },
      timestamp: new Date().toISOString(),
      // Environment context
      service: "bunvel-api",
      version: process.env.npm_package_version || "0.0.0",
      nodeEnv: env.NODE_ENV,
    };

    errorLogger.error(wideEvent);
  });
