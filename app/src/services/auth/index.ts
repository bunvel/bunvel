import Elysia, { t } from "elysia";
import { db } from "../../database";

export const authService = new Elysia({ prefix: "/auth" }).get(
  "/users",
  async ({ query, set }) => {
    try {
      const { page = 1, limit = 100 } = query;

      const users = await db`SELECT id, name, email, phone, created_at, updated_at, last_sign_in_at FROM auth.users LIMIT ${limit} OFFSET ${
        (page - 1) * limit
      }`;
      const totalCount = await db`SELECT COUNT(*) FROM auth.users`;
      return Response.json({
        data: users,
        totalCount: totalCount[0].count,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].count / limit),
        hasNextPage: page < Math.ceil(totalCount[0].count / limit),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Query execution failed";
      set.status = 400;
      return Response.json({ message: errorMessage });
    }
  },
  {
    query: t.Object({
      page: t.Integer({
        description: "Page number",
        default: 1,
      }),
      limit: t.Integer({
        description: "Limit of results",
        default: 100,
      }),
    }),
  }
);
