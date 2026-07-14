/**
 * Collection-level routes: /:table
 *
 *  GET    /rest/:table          – list rows (filtering, ordering, pagination)
 *  POST   /rest/:table          – insert one row OR bulk-insert array of rows
 *  PATCH  /rest/:table          – bulk-update rows matching URL filters
 *  DELETE /rest/:table          – bulk-delete rows matching URL filters
 */

import Elysia, { t } from "elysia";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "elysia-http-exception";
import { db } from "../../../../core/database";
import { getSchema } from "../schema";
import {
  buildBulkInsert,
  buildCount,
  buildDeleteByFilter,
  buildInsert,
  buildSelect,
  buildUpdateByFilter,
  parseQueryParams,
} from "../query-builder";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resolveTable(name: string) {
  const schema = await getSchema();
  const table = schema.tables.get(name);
  if (!table) {
    throw new NotFoundException(`Relation "${name}" does not exist`);
  }
  return table;
}

function isReadOnly(tableType: string) {
  return tableType === "VIEW" || tableType === "MATERIALIZED VIEW";
}

// Run a parameterized query via db.unsafe (Bun SQL).
async function run<T = Record<string, unknown>>(
  sql: string,
  params: unknown[],
): Promise<T[]> {
  return params.length > 0
    ? db.unsafe<T[]>(sql, params as any[])
    : db.unsafe<T[]>(sql);
}

// ---------------------------------------------------------------------------
// Route plugin
// ---------------------------------------------------------------------------

export const tableRoutes = new Elysia({ prefix: "/:table" })

  // -------------------------------------------------------------------------
  // GET /:table — list rows
  // -------------------------------------------------------------------------
  .get(
    "/",
    async ({ params, query, request, set }) => {
      const schema = await getSchema();
      const table = schema.tables.get(params.table);
      if (!table) {
        throw new NotFoundException(`Relation "${params.table}" does not exist`);
      }
      const urlParams = new URL(request.url).searchParams;

      let parsed;
      try {
        parsed = parseQueryParams(urlParams, table);
      } catch (err) {
        throw new BadRequestException({
          error: "Invalid query parameters",
          message: err instanceof Error ? err.message : String(err),
        });
      }

      try {
        const { sql, params: sqlParams } = buildSelect(table, parsed, schema);

        // Return Content-Range header (like PostgREST)
        const { sql: countSql, params: countParams } = buildCount(table, parsed);
        const [countRow] = await run<{ count: string }>(countSql, countParams);
        const total = parseInt(countRow?.count ?? "0", 10);

        const rows = await run(sql, sqlParams);

        const from = parsed.offset;
        const to = Math.max(0, from + rows.length - 1);
        set.headers["Content-Range"] = `${from}-${to}/${total}`;
        set.headers["X-Total-Count"] = String(total);

        return rows;
      } catch (err) {
        if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Query failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String() }),
      response: t.Union([
        t.Array(t.Any()),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "List rows",
        description:
          "Fetch rows from a table/view. Supports ?select, ?order, ?limit, ?offset, and PostgREST-style column filters (e.g. ?price=gte.100).",
        tags: ["REST"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // POST /:table — insert one or many rows
  // -------------------------------------------------------------------------
  .post(
    "/",
    async ({ params, body, set }) => {
      const table = await resolveTable(params.table);

      if (isReadOnly(table.tableType)) {
        throw new BadRequestException({
          error: "Read-only relation",
          message: `"${table.name}" is a ${table.tableType.toLowerCase()} and cannot be written to`,
        });
      }

      if (!body || (typeof body !== "object")) {
        throw new BadRequestException({ error: "Request body must be a JSON object or array" });
      }

      try {
        let result: Record<string, unknown>[];

        if (Array.isArray(body)) {
          if (body.length === 0) throw new BadRequestException({ error: "Body array is empty" });
          const { sql, params: p } = buildBulkInsert(table, body as Record<string, unknown>[]);
          result = await run(sql, p);
          set.status = 201;
          return result;
        } else {
          const { sql, params: p } = buildInsert(table, body as Record<string, unknown>);
          result = await run(sql, p);
          set.status = 201;
          return result[0] ?? null;
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Insert failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String() }),
      body: t.Union([t.Object({}, { additionalProperties: true }), t.Array(t.Any())]),
      response: t.Union([
        t.Any(),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Insert row(s)",
        description: "Insert a single JSON object or an array of objects. Returns the inserted row(s) with all fields.",
        tags: ["REST"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // PATCH /:table — bulk update rows matching URL filters
  // -------------------------------------------------------------------------
  .patch(
    "/",
    async ({ params, body, request }) => {
      const table = await resolveTable(params.table);

      if (isReadOnly(table.tableType)) {
        throw new BadRequestException({
          error: "Read-only relation",
          message: `"${table.name}" is a ${table.tableType.toLowerCase()} and cannot be written to`,
        });
      }

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new BadRequestException({ error: "Request body must be a plain JSON object" });
      }

      const urlParams = new URL(request.url).searchParams;
      let parsed;
      try {
        parsed = parseQueryParams(urlParams, table);
      } catch (err) {
        throw new BadRequestException({
          error: "Invalid query parameters",
          message: err instanceof Error ? err.message : String(err),
        });
      }

      try {
        const { sql, params: p } = buildUpdateByFilter(table, parsed, body as Record<string, unknown>);
        const rows = await run(sql, p);
        return rows;
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Update failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String() }),
      body: t.Object({}, { additionalProperties: true }),
      response: t.Union([
        t.Array(t.Any()),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Bulk update rows",
        description: "Update rows matching URL filter params. Requires at least one filter. Returns affected rows.",
        tags: ["REST"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // DELETE /:table — bulk delete rows matching URL filters
  // -------------------------------------------------------------------------
  .delete(
    "/",
    async ({ params, request, set }) => {
      const table = await resolveTable(params.table);

      if (isReadOnly(table.tableType)) {
        throw new BadRequestException({
          error: "Read-only relation",
          message: `"${table.name}" is a ${table.tableType.toLowerCase()} and cannot be written to`,
        });
      }

      const urlParams = new URL(request.url).searchParams;
      let parsed;
      try {
        parsed = parseQueryParams(urlParams, table);
      } catch (err) {
        throw new BadRequestException({
          error: "Invalid query parameters",
          message: err instanceof Error ? err.message : String(err),
        });
      }

      try {
        const { sql, params: p } = buildDeleteByFilter(table, parsed);
        const rows = await run(sql, p);
        set.status = 200;
        return rows;
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Delete failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String() }),
      response: t.Union([
        t.Array(t.Any()),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Bulk delete rows",
        description: "Delete rows matching URL filter params. Requires at least one filter to prevent full-table wipe.",
        tags: ["REST"],
      },
    },
  );
