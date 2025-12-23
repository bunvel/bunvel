import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { httpExceptionPlugin } from "elysia-http-exception";
import { rateLimit } from "elysia-rate-limit";
import { metaService } from "./services/meta";
import { restService } from "./services/rest";

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "ALLOWED_ORIGINS"];
const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingVars.length > 0 && process.env.NODE_ENV === "production") {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(", ")}`
  );
  process.exit(1);
}

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((origin) =>
  origin.trim()
) || ["http://localhost:3000"];

const app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get("origin");
        if (!origin || allowedOrigins.includes(origin)) {
          return true;
        }
        return false;
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposeHeaders: ["Content-Length"],
      credentials: true,
      maxAge: 86400, // 24 hours
    })
  )

  // Rate limiting
  .use(
    rateLimit({
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10), // Default 100 requests per window
      skip: (request) => {
        // Skip rate limiting for health checks
        return request.url.endsWith("/health");
      },
    })
  )

  // Error handling
  .use(httpExceptionPlugin())

  // Request size limit
  .onRequest(({ request, set }) => {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
      // 10MB limit
      set.status = 413; // Payload Too Large
      return { error: "Request entity too large" };
    }
  })

  // Health check endpoint
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  }))

  // Root endpoint
  .get("/", () => ({
    name: "Bunvel API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    documentation: "/docs", // If you add API documentation
  }))

  // Application routes
  .use(restService)
  .use(metaService)

  // Global error handler
  .onError(({ code, error, set }) => {
    console.error(`[${new Date().toISOString()}] ${code}: ${error}`);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not Found" };
    }

    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === "production";
    return {
      error: isProduction ? "Internal Server Error" : error,
      ...(isProduction ? {} : { stack: error }),
    };
  });

// Start the server
const port = parseInt(process.env.PORT || "8000", 10);
const hostname = process.env.HOST || "0.0.0.0";

app.listen({
  port,
  hostname,
});

console.log(`🚀 Bunvel API is running at http://${hostname}:${port}`);

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Perform cleanup if needed
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Consider logging the error and restarting the process
  // process.exit(1);
});
