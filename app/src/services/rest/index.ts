import Elysia, { t } from "elysia";
import { logger } from "../../plugins/logging";
import { env } from "../../utils/config";
import { ALLOWED_METHODS, JSON_CONTENT_TYPE } from "../../utils/constant";

export const restService = new Elysia({
  name: "Rest Service",
  detail: {
    description:
      "REST API with schema introspection and advanced query capabilities",
  },
  prefix: "/rest",
}).all(
  "/*",
  async ({ request, set }) => {
    try {
      if (!ALLOWED_METHODS.has(request.method)) {
        set.status = 405;
        return { error: "Method not allowed" };
      }

      const url = new URL(request.url);
      const targetPath = url.pathname.replace(/^\/rest/, "");
      const target = new URL(
        targetPath,
        env.POSTGREST_URL.replace(/\/$/, ""),
      ).toString();
      const targetWithQuery = url.search ? `${target}${url.search}` : target;

      logger.info({
        event: "rest.request.proxying",
        method: request.method,
        originalUrl: request.url,
        targetUrl: targetWithQuery,
      });

      const headers = new Headers(request.headers);
      headers.set("Content-Type", JSON_CONTENT_TYPE);
      headers.set("Accept", JSON_CONTENT_TYPE);

      const init: RequestInit = {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : request.body,
      };

      const response = await fetch(targetWithQuery, init);
      set.status = response.status;

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes(JSON_CONTENT_TYPE)
        ? await response.json()
        : await response.text();

      logger.info({
        event: "rest.request.completed",
        method: request.method,
        originalUrl: request.url,
        targetUrl: targetWithQuery,
        statusCode: response.status,
      });

      return contentType.includes(JSON_CONTENT_TYPE) ? result : result;
    } catch (error) {
      logger.error({
        event: "rest.request.failed",
        method: request.method,
        url: request.url,
      });

      set.status = 500;
      return {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
  {
    response: t.Union([
      t.Any(),
      t.Object({
        error: t.String(),
        details: t.Optional(t.String()),
      }),
    ]),
  },
);
