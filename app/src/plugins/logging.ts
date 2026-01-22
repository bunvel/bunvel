import { Elysia } from "elysia";
import winston from "winston";
import { env } from "../utils/config";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "bunvel-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/routes.log" }),
  ],
});

if (env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// Separate logger for queries
const queryLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "bunvel-queries" },
  transports: [new winston.transports.File({ filename: "logs/queries.log" })],
});

if (env.NODE_ENV !== "production") {
  queryLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

export const loggingPlugin = new Elysia({ name: "Logging Plugin" })
  .onRequest(({ request, set }) => {
    const start = Date.now();
    set.headers["x-request-start"] = start.toString();

    logger.info("Incoming request", {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      timestamp: new Date().toISOString(),
    });
  })
  .onAfterHandle(({ request, set }) => {
    const start = parseInt(String(set.headers["x-request-start"] || "0"));
    const duration = Date.now() - start;

    logger.info("Request completed", {
      method: request.method,
      url: request.url,
      statusCode: set.status || 200,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  })
  .onError(({ error, request, set }) => {
    const start = parseInt(String(set.headers["x-request-start"] || "0"));
    const duration = Date.now() - start;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error("Request failed", {
      method: request.method,
      url: request.url,
      statusCode: set.status || 500,
      error: errorMessage,
      stack: errorStack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

export { logger, queryLogger };
