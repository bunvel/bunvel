import Elysia, { t } from "elysia";
import {
  InternalServerErrorException,
  MethodNotAllowedException,
} from "elysia-http-exception";
import { env } from "../../config/env";
import { ALLOWED_METHODS, JSON_CONTENT_TYPE } from "../../config/constants";

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
        throw new MethodNotAllowedException("Method not allowed");
      }

      const url = new URL(request.url);
      const targetPath = url.pathname.replace(/^\/rest/, "");
      const target = new URL(
        targetPath,
        env.POSTGREST_URL.replace(/\/$/, ""),
      ).toString();
      const targetWithQuery = url.search ? `${target}${url.search}` : target;

      const headers = new Headers(request.headers);
      headers.set("Accept", JSON_CONTENT_TYPE);
      headers.set("Content-Type", JSON_CONTENT_TYPE);
      headers.delete("host");

      const response = await fetch(targetWithQuery, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : request.body,
      });

      set.status = response.status;
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  },
  {
    response: t.Union([
      t.Any(),
      t.Object({
        statusCode: t.Number(),
        error: t.Optional(t.String()),
        details: t.Optional(t.String()),
        message: t.Optional(t.Union([t.String(), t.Any()])),
      }),
    ]),
  },
);
