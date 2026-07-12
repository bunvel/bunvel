import { Elysia } from "elysia";
import { env } from "../config/env";
import { errorLogger, httpLogger } from "../core/logger";

type ElysiaSet = Record<string, unknown> & {
  headers?: Record<string, string | number>;
};

const sanitizeIp = (rawIp: string) =>
  env.NODE_ENV === "production"
    ? rawIp.split(".").slice(0, 2).join(".") + ".x.x"
    : rawIp;

const requestMetadata = (request: Request) => {
  const url = new URL(request.url);
  const rawIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return {
    path: url.pathname,
    query: url.search || undefined,
    userAgent: request.headers.get("user-agent")?.slice(0, 200) || "unknown",
    ip: sanitizeIp(rawIp),
  };
};

const buildHttpEvent = (
  request: Request,
  set: ElysiaSet,
  statusCode: number,
  duration: number,
  extra: Record<string, unknown> = {},
) => {
  const { path, query, userAgent, ip } = requestMetadata(request);

  return {
    event: "http.request",
    correlationId: set.headers?.["x-correlation-id"] ?? "",
    method: request.method,
    path,
    query,
    statusCode,
    duration,
    userAgent,
    ip,
    timestamp: new Date().toISOString(),
    service: "bunvel-api",
    version: process.env.npm_package_version || "0.0.0",
    nodeEnv: env.NODE_ENV,
    ...extra,
  };
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
    const statusCode = Number(set.status ?? 200);

    httpLogger[statusCode >= 400 ? "error" : "info"](
      buildHttpEvent(request, set, statusCode, duration),
    );
  })
  .onError(({ error, request, set }) => {
    const start = parseInt(String(set.headers["x-request-start"] || "0"));
    const duration = Date.now() - start;
    const statusCode = Number(set.status ?? 500);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error);

    errorLogger.error(
      buildHttpEvent(request, set, statusCode, duration, {
        error: {
          message: errorMessage,
          type:
            error && typeof error === "object" && "name" in error
              ? String(error.name)
              : "Error",
          ...(env.NODE_ENV === "development" &&
          error &&
          typeof error === "object" &&
          "stack" in error
            ? { stack: String(error.stack) }
            : {}),
        },
      }),
    );
  });
