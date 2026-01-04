import Elysia, { t } from "elysia";
import { db } from "../../../../database";
import { MAX_QUERY_LENGTH } from "../../../../utils/constant";


export const rawQuery = new Elysia().post(
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
);