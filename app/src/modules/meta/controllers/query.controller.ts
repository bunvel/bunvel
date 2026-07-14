import Elysia, { t } from "elysia";
import {
  BadRequestException,
  InternalServerErrorException,
} from "elysia-http-exception";
import {
  MAX_PARAMS_LENGTH,
  MAX_QUERY_LENGTH,
} from "../../../config/constants";
import { QueryService } from "../services/query.service";

export const queryRoutes = new Elysia({ prefix: "/query" }).post(
  "/",
  async ({ body }) => {
    // Validate query
    if (!body.query || body.query.length > MAX_QUERY_LENGTH) {
      throw new BadRequestException({
        error: "Query validation failed",
        message: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters. Please shorten your query and try again.`,
      });
    }

    const query = body.query.trim();
    if (!query) {
      throw new BadRequestException({
        error: "Query validation failed",
        message: "Query cannot be empty. Please provide a valid SQL query.",
      });
    }

    // Validate parameters if provided
    if (body.params !== undefined) {
      if (JSON.stringify(body.params).length > MAX_PARAMS_LENGTH) {
        throw new BadRequestException({
          error: "Parameter validation failed",
          message: `Query parameters exceed maximum allowed size of ${MAX_PARAMS_LENGTH} characters. Please reduce the size of your parameters.`,
        });
      }
    }

    try {
      const result = await QueryService.execute(query, body.params);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? `Query execution failed: ${error.message}`
          : "An unexpected error occurred while executing the query";

      throw new InternalServerErrorException({
        error: "Query execution failed",
        message,
      });
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
        statusCode: t.Number(),
        error: t.Optional(t.String()),
        message: t.Optional(t.Union([t.String(), t.Any()])),
      }),
    ]),
  }
);
