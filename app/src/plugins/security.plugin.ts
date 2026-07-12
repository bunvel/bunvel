import { Elysia } from "elysia";

export const securityPlugin = new Elysia({ name: "security" }).onRequest(
  ({ set }) => {
    // Basic Security Headers
    set.headers["X-Content-Type-Options"] = "nosniff";
    set.headers["X-Frame-Options"] = "DENY";
    set.headers["X-XSS-Protection"] = "1; mode=block";
    set.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    set.headers["Content-Security-Policy"] = "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests";
  },
);
