import Elysia from "elysia";
import { env } from "../../utils/config";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);
const JSON_CONTENT_TYPE = "application/json";

export const restService = new Elysia({
  name: "Rest Service",
  detail: {
    description: "REST API with schema introspection and advanced query capabilities",
  },
  prefix: "/rest"
}).all("/*", async ({ request, set }) => {
  try {
    if (!ALLOWED_METHODS.has(request.method)) {
      set.status = 405;
      return { error: "Method not allowed" };
    }

    const url = new URL(request.url);
    const targetPath = url.pathname.replace(/^\/rest/, "");
    const target = new URL(targetPath, env.POSTGREST_URL.replace(/\/$/, "")).toString();
    const targetWithQuery = url.search ? `${target}${url.search}` : target;

    const headers = new Headers(request.headers);
    headers.set("Content-Type", JSON_CONTENT_TYPE);
    headers.set("Accept", JSON_CONTENT_TYPE);

    const init: RequestInit = {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    };

    const response = await fetch(targetWithQuery, init);
    set.status = response.status;

    const contentType = response.headers.get("content-type") || "";
    return contentType.includes(JSON_CONTENT_TYPE)
      ? response.json()
      : response.text();

  } catch (error) {
    set.status = 500;
    return { 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    };
  }
});
