import Elysia, { t } from "elysia";
import { db } from "../../../../database";
import { MAX_PARAMS_LENGTH, MAX_QUERY_LENGTH } from "../../../../utils/constant";


export const query = new Elysia().post(
  "/query",
  async ({ body, set }) => {
    if (!body.query || body.query.length > MAX_QUERY_LENGTH) {
      set.status = 400;
      return Response.json({ message: `Query too long. Maximum length is ${MAX_QUERY_LENGTH} characters.` });
    }

    try {
      const statements = body.query
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let selectResult = [];
      let hasSelect = false;

      for (const statement of statements) {
        const firstWord = statement.trim().split(/\s+/)[0].toUpperCase();
        
        const result = await db.unsafe(statement);
        
        // If this is a SELECT and we haven't captured a SELECT result yet
        if (firstWord === 'SELECT' && !hasSelect) {
          selectResult = Array.isArray(result) ? result : [result];
          hasSelect = true;
        }
      }

      // Return just the array of results if there was a SELECT
      // Otherwise return an empty array
      return hasSelect ? Response.json(selectResult) : Response.json([]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Query execution failed";
      set.status = 400;
      return Response.json({ message: errorMessage });
    }
  },
  {
    body: t.Object({
      query: t.String({
        description: "SQL query to execute (can contain multiple statements separated by semicolons)",
        maxLength: MAX_QUERY_LENGTH,
      }),
    }),
  }
)
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