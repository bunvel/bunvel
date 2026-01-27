import pino from "pino";
import { LOGGING_CONFIG } from "../utils/constant";

export const logger = pino({
  level: LOGGING_CONFIG.level,
  base: LOGGING_CONFIG.base,
  timestamp: pino.stdTimeFunctions[LOGGING_CONFIG.timestamp],
});

export const queryLogger = logger.child({
  service: "bunvel-queries",
});

export const errorLogger = logger.child({
  service: "bunvel-errors",
});

import { Elysia } from "elysia";

export const loggingPlugin = new Elysia({ name: "logging" })

  .onRequest(({ request, set }) => {
    const start = Date.now();
    const correlationId = Bun.randomUUIDv7();

    set.headers["x-request-start"] = start.toString();
    set.headers["x-correlation-id"] = correlationId;

    logger.info({
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

    logger.info({
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
