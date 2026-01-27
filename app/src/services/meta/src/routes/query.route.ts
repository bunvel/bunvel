import Elysia, { t } from "elysia";
import { db } from "../../../../database";
import { queryLogger } from "../../../../plugins/logging";
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
      return {
        error: "Query validation failed",
        message: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters. Please shorten your query and try again.`,
      };
    }

    const query = body.query.trim();
    if (!query) {
      set.status = 400;
      return {
        error: "Query validation failed",
        message: "Query cannot be empty. Please provide a valid SQL query.",
      };
    }

    // Validate parameters if provided
    if (body.params !== undefined) {
      if (JSON.stringify(body.params).length > MAX_PARAMS_LENGTH) {
        set.status = 400;
        return {
          error: "Parameter validation failed",
          message: `Query parameters exceed maximum allowed size of ${MAX_PARAMS_LENGTH} characters. Please reduce the size of your parameters.`,
        };
      }
    }

    try {
      queryLogger.info({
        event: "sql.query.executed",
        query: query,
        params: body.params,
      });

      // Execute query with or without parameters
      const result = await db.begin(async (tx) => {
        return body.params
          ? await tx.unsafe(query, body.params)
          : await tx.unsafe(query);
      });

      // Handle empty result set
      if (
        Array.isArray(result) &&
        Array.isArray(result[0]) &&
        result[0].length === 0
      ) {
        return [];
      }

      const resultCount = Array.isArray(result) ? result.length : 1;
      queryLogger.info({
        event: "sql.query.completed",
        query: query,
        resultCount: resultCount,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? `Query execution failed: ${error.message}`
          : "An unexpected error occurred while executing the query";

      queryLogger.error({
        event: "sql.query.failed",
        query: query,
        params: body.params,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      set.status = 400;
      return {
        error: "Query execution failed",
        message,
      };
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
        t.Array(t.Union([t.String(), t.Number(), t.Boolean(), t.Null()]), {
          description:
            "Optional array of parameter values to be safely interpolated into the query",
        }),
      ),
    }),
    response: t.Union([
      t.Array(t.Any()),
      t.Object({
        error: t.String(),
        message: t.String(),
      }),
    ]),
  },
);
