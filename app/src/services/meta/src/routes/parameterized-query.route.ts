import Elysia, { t } from "elysia";
import { db } from "../../../../database";
import { MAX_PARAMS_LENGTH, MAX_QUERY_LENGTH } from "../../../../utils/constant";


export const parameterizedQuery = new Elysia()
.post(
  "/parameterized-query",
  async ({ body, set }) => {
    if (body.query.length > MAX_QUERY_LENGTH) {
      set.status = 400;
      return Response.json({ message: `Query too long. Maximum length is ${MAX_QUERY_LENGTH} characters.` });
    }

    if (JSON.stringify(body.params).length > MAX_PARAMS_LENGTH) {
      set.status = 400;
      return Response.json({ message: `Parameters too large. Maximum size is ${MAX_PARAMS_LENGTH} characters.` });
    }

    try {
      // For parameterized queries, we'll only allow a single statement
      const result = await db.unsafe(body.query, body.params);
      return Response.json(Array.isArray(result) ? result : [result]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Query execution failed";
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
        description: "Array of parameter values to be safely interpolated into the query",
      }),
    }),
  }
);