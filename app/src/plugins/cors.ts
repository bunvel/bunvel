import { cors } from "@elysiajs/cors";
import Elysia from "elysia";
import { env } from "../utils/config";
import { CORS_CONFIG } from "../utils/constant";

export const corsPlugin = new Elysia().use(
  cors({
    origin: (request) => {
      const origin = request.headers.get("origin");
      if (!origin || env.VITE_BUNVEL_STUDIO_URL === origin) {
        return true;
      }
      return false;
    },
    ...CORS_CONFIG,
  }),
);
