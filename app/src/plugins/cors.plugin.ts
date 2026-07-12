import { cors } from "@elysiajs/cors";
import { env } from "../config/env";
import { CORS_CONFIG } from "../config/constants";

export const corsPlugin = cors({
  origin: (request) => {
    const origin = request.headers.get("origin");
    return !origin || env.VITE_BUNVEL_STUDIO_URL === origin;
  },
  ...CORS_CONFIG,
});
