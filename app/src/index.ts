import { Elysia, status as error } from "elysia";
import { httpExceptionPlugin } from "elysia-http-exception";
import { rateLimit } from "elysia-rate-limit";
import { corsPlugin } from "./plugins/cors";
import { loggingPlugin } from "./plugins/logging";
import { metaService } from "./services/meta";
import { restService } from "./services/rest";
import { auth } from "./auth";
import { env } from "./utils/config";

const app = new Elysia()
  // Logging configuration
  .use(loggingPlugin)

  // CORS configuration
  .use(corsPlugin)

  // Rate limiting
  .use(
    rateLimit({
      max: env.RATE_LIMIT_MAX_REQUESTS,
      duration: env.RATE_LIMIT_WINDOW_MS,
      headers: true,
      skip: (request) => request.url === "/",
    }),
  )

  // Better Auth handler
  .mount(auth.handler)

  // Auth macro
  .macro({
    auth: {
      async resolve({ request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) {
          return error(401, "Unauthorized");
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })

  // Error handling
  .use(httpExceptionPlugin())

  // Root endpoint
  .get("/", () => Response.json({ message: "Welcome to Bunvel" }))

  // Application routes
  .use(restService)
  .use(metaService)
  .listen({ port: env.PORT, hostname: "0.0.0.0" });

// Auto-provision admin user
if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
  setTimeout(async () => {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: env.ADMIN_EMAIL!,
          password: env.ADMIN_PASSWORD!,
          name: "Admin",
        },
      });
      if (res && (res as any).user) {
        console.log("✅ Initial admin user provisioned successfully.");
      }
    } catch (err: any) {
      // Ignored: mostly "User already exists"
    }
  }, 1000);
}
