import { cors } from "@elysiajs/cors";
import Elysia from "elysia";
import { env } from "../utils/config";

export const corsPlugin = new Elysia().use(
  cors({
    origin: (request) => {
      const origin = request.headers.get("origin");
      if (!origin || env.VITE_BUNVEL_STUDIO_URL === origin) {
        return true;
      }
      return false;
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);
