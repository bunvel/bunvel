import Elysia, { t } from "elysia";
import { db } from "../../../../database";
import {
  MAX_PARAMS_LENGTH,
  MAX_QUERY_LENGTH,
} from "../../../../utils/constant";

export const queryRoutes = new Elysia({ prefix: "/query" }).post(
  "/",
  async ({ body, set }) => {
    // Validate query
    if (!body.query || body.query.length > MAX_QUERY_LENGTH) {
      set.status = 400;
      return Response.json({
        message: `Query too long. Maximum length is ${MAX_QUERY_LENGTH} characters.`,
      });
    }

    const query = body.query.trim();
    if (!query) {
      set.status = 400;
      return Response.json({ message: "Empty query" });
    }

    // Validate parameters if provided
    if (body.params !== undefined) {
      if (JSON.stringify(body.params).length > MAX_PARAMS_LENGTH) {
        set.status = 400;
        return Response.json({
          message: `Parameters too large. Maximum size is ${MAX_PARAMS_LENGTH} characters.`,
        });
      }
    }

    try {
      // Execute query with or without parameters
      const result = body.params
        ? await db.unsafe(query, body.params)
        : await db.unsafe(query);

      // Normalize response
      if (Array.isArray(result)) {
        return Response.json(result);
      }
      return Response.json(
        result === undefined || result === null ? [] : [result]
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Query execution failed";
      set.status = 400;
      return Response.json({ message });
    }
  },
  {
    body: t.Object({
      query: t.String({
        description:
          "SQL query to execute (can include parameter placeholders $1, $2, etc.)",
        maxLength: MAX_QUERY_LENGTH,
      }),
      params: t.Optional(
        t.Array(t.Unknown(), {
          description:
            "Optional array of parameter values to be safely interpolated into the query",
        })
      ),
    }),
  }
);
