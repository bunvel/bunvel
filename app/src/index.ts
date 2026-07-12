import { Elysia, status as error } from "elysia";
import { httpExceptionPlugin } from "elysia-http-exception";
import { rateLimit } from "elysia-rate-limit";
import { env } from "./config/env";
import { db } from "./core/database";
import { logger } from "./core/logger";
import { auth } from "./modules/auth";
import { metaService } from "./modules/meta";
import { restService } from "./modules/rest";
import { corsPlugin } from "./plugins/cors.plugin";
import { loggingPlugin } from "./plugins/logging.plugin";
import { securityPlugin } from "./plugins/security.plugin";

const app = new Elysia()
  // Security headers
  .use(securityPlugin)

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
      async resolve({ request: { headers } }: { request: Request }) {
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
  .listen({ port: env.PORT, hostname: "0.0.0.0" }, (server) => {
    logger.info(`🦊 Server is running at http://${server?.hostname}:${server?.port}`);
  });

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
        logger.info("✅ Initial admin user provisioned successfully.");
      }
    } catch (err: any) {
      // Ignored: mostly "User already exists"
    }
  }, 1000);
}

// Graceful Shutdown handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await app.stop();
    logger.info("HTTP server stopped.");

    // Attempt to close DB connection if method exists (bun SQL supports .close())
    if (typeof (db as any).close === 'function') {
      (db as any).close();
      logger.info("Database connections closed.");
    }

    logger.info("Graceful shutdown complete.");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Error during graceful shutdown");
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
