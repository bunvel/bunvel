import Elysia, { t } from "elysia";
import { db } from "../../../../database";
import {
  MAX_PARAMS_LENGTH,
  MAX_QUERY_LENGTH,
} from "../../../../utils/constant";

export const queryRoutes = new Elysia({ prefix: "/query" })
  // Raw query endpoint (multiple statements allowed, no parameters)
  .post(
    "/",
    async ({ body, set }) => {
      if (!body.query || body.query.length > MAX_QUERY_LENGTH) {
        set.status = 400;
        return Response.json({
          message: `Query too long. Maximum length is ${MAX_QUERY_LENGTH} characters.`,
        });
      }

      try {
        const query = body.query.trim();

        if (!query) {
          set.status = 400;
          return Response.json({ message: "Empty query" });
        }

        // Execute FULL query as-is
        const result = await db.unsafe(query);

        // Normalize response
        if (Array.isArray(result)) {
          return Response.json(result);
        }

        if (result === undefined || result === null) {
          return Response.json([]);
        }

        return Response.json([result]);
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
          description: "SQL query to execute (single or multi-statement)",
          maxLength: MAX_QUERY_LENGTH,
        }),
      }),
    }
  )
  // Parameterized query endpoint (single statement with parameters)
  .post(
    "/parameterized",
    async ({ body, set }) => {
      if (body.query.length > MAX_QUERY_LENGTH) {
        set.status = 400;
        return Response.json({
          message: `Query too long. Maximum length is ${MAX_QUERY_LENGTH} characters.`,
        });
      }

      if (JSON.stringify(body.params).length > MAX_PARAMS_LENGTH) {
        set.status = 400;
        return Response.json({
          message: `Parameters too large. Maximum size is ${MAX_PARAMS_LENGTH} characters.`,
        });
      }

      try {
        const result = await db.unsafe(body.query, body.params);
        return Response.json(Array.isArray(result) ? result : [result]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Query execution failed";
        set.status = 400;
        return Response.json({ message: errorMessage });
      }
    },
    {
      body: t.Object({
        query: t.String({
          description: "SQL query with parameter placeholders ($1, $2, etc.)",
          maxLength: MAX_QUERY_LENGTH,
        }),
        params: t.Array(t.Unknown(), {
          description:
            "Array of parameter values to be safely interpolated into the query",
        }),
      }),
    }
  );
