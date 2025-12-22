import Elysia, { t } from "elysia";
import { db } from "../../../../database";

const hasLimitClause = (query: string): boolean => {
  const normalized = query.trim().toUpperCase();
  return normalized.includes(' LIMIT ') || 
         normalized.endsWith(' LIMIT') ||
         normalized.includes('\nLIMIT ') ||
         normalized.includes('\tLIMIT ');
};

export const query = new Elysia().post(
  "/query",
  async ({ body }) => {
    const startTime = process.hrtime();

    try {
      let { query: sqlQuery } = body;
      // Remove trailing semicolon and trim whitespace
      sqlQuery = sqlQuery.trim().replace(/;+\s*$/, '');
      const page = 1;
      const pageSize = 100;
      const offset = (page - 1) * pageSize;

      const countQuery = `SELECT COUNT(*) as total FROM (${sqlQuery}) as count_query`;
      const paginatedQuery = hasLimitClause(sqlQuery) 
        ? sqlQuery  // Use original query if it already has LIMIT
        : `${sqlQuery} LIMIT ${pageSize} OFFSET ${offset}`;

      const [countResult, dataResult] = await Promise.all([
        db.unsafe(countQuery).then((res) => {
          console.log('Count result:', res);
          return res[0]?.total;
        }),
        db.unsafe(paginatedQuery).then((res) => {
          console.log('Data result:', res);
          return res;
        }),
      ]);

      const total = Number(countResult);
      const totalPages = Math.ceil(total / (hasLimitClause(sqlQuery) ? 1 : pageSize));
      const executionTime = process.hrtime(startTime);

      console.log('Total rows:', total);
      console.log('Data rows:', dataResult.length);

      const response = {
        success: true,
        data: dataResult,
        pagination: {
          total: total,
          totalPages: hasLimitClause(sqlQuery) ? 1 : totalPages,
          currentPage: hasLimitClause(sqlQuery) ? 1 : page,
          pageSize: hasLimitClause(sqlQuery) ? total : pageSize,
          hasNextPage: hasLimitClause(sqlQuery) ? false : page < totalPages,
          hasPreviousPage: hasLimitClause(sqlQuery) ? false : page > 1,
        },
        execution: {
          time: `${(executionTime[0] * 1000 + executionTime[1] / 1e6).toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
        },
      };

      return Response.json(response);
    } catch (error) {
      const executionTime = process.hrtime(startTime);
      console.error("SQL Execution Error:", error);

      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to execute SQL query",
        execution: {
          time: `${(executionTime[0] * 1000 + executionTime[1] / 1e6).toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
  {
    body: t.Object({
      query: t.String({
        description: "SQL query to execute (should be a SELECT query)",
        examples: ["SELECT * FROM users", "SELECT id, name FROM public.users"],
      }),
    }),
  }
);