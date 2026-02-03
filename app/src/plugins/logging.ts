import { Elysia } from "elysia";
import pino from "pino";
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
    process.env.NODE_ENV === "development"
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
    process.env.NODE_ENV !== "development"
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

    httpLogger.info({
      event: "http.request.start",
      correlationId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
    });
  })

  .onAfterHandle(({ request, set }) => {
    const start = parseInt(String(set.headers["x-request-start"] || "0"));
    const duration = Date.now() - start;
    const correlationId = set.headers["x-correlation-id"] as string;

    httpLogger.info({
      event: "http.request.end",
      correlationId,
      method: request.method,
      url: request.url,
      statusCode: set.status ?? 200,
      duration,
    });
  })

  .onError(({ error, request, set }) => {
    const start = parseInt(String(set.headers["x-request-start"] || "0"));
    const duration = Date.now() - start;
    const correlationId = set.headers["x-correlation-id"] as string;

    let errorMessage: string | undefined;
    let errorStack: string | undefined;
    let errorName: string | undefined;

    if (error && typeof error === "object") {
      if ("message" in error) {
        errorMessage = String(error.message);
      }
      if ("stack" in error) {
        errorStack = String(error.stack);
      }
      if ("name" in error) {
        errorName = String(error.name);
      }
    } else {
      errorMessage = String(error);
    }

    errorLogger.error({
      event: "http.request.error",
      correlationId,
      method: request.method,
      url: request.url,
      statusCode: set.status ?? 500,
      duration,
      error: {
        message: errorMessage,
        stack: errorStack,
        name: errorName,
      },
    });
  });
