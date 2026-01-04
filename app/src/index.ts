import { Elysia } from "elysia";
import { httpExceptionPlugin } from "elysia-http-exception";
import { rateLimit } from "elysia-rate-limit";
import { corsPlugin } from "./plugins/cors";
import { authService } from "./services/auth";
import { metaService } from "./services/meta";
import { restService } from "./services/rest";
import { env } from "./utils/config";

const app = new Elysia()
  // CORS configuration
  .use(corsPlugin)

  // Rate limiting
  .use(
    rateLimit({
      max: env.RATE_LIMIT_MAX_REQUESTS,
      skip: (request) => {
        // Skip rate limiting for health checks
        return request.url == "/";
      },
    })
  )

  // Error handling
  .use(httpExceptionPlugin())

  // Root endpoint
  .get("/", () => Response.json("Welcome to Bunvel"))

  // Application routes
  .use(restService)
  .use(metaService)
  .use(authService)
  .listen(env.PORT || "8000");