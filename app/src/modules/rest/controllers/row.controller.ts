/**
 * Single-resource routes: /:table/:id  (single-column PK)
 * and /:table/:pk1/:pk2 for composite PKs (up to 2 columns for path routing).
 *
 *  GET    /rest/:table/:id   – fetch one row by PK
 *  PUT    /rest/:table/:id   – full replace (all non-PK fields required)
 *  PATCH  /rest/:table/:id   – partial update (only supplied fields)
 *  DELETE /rest/:table/:id   – delete one row by PK
 *
 * For tables with a composite PK the client passes values as a
 * comma-separated list in the :id segment:  /order_items/42,7
 */

import Elysia, { t } from "elysia";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "elysia-http-exception";
import { db } from "../../../core/database";
import { SchemaService } from "../services/schema.service";
import { QueryBuilderService } from "../services/query-builder.service";
import { QueryParserService } from "../services/query-parser.service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resolveTable(name: string) {
  const schema = await SchemaService.get();
  const table = schema.tables.get(name);
  if (!table) throw new NotFoundException(`Relation "${name}" does not exist`);
  return table;
}

function isReadOnly(tableType: string) {
  return tableType === "VIEW" || tableType === "MATERIALIZED VIEW";
}

async function run<T = Record<string, unknown>>(
  sql: string,
  params: unknown[],
): Promise<T[]> {
  return params.length > 0
    ? db.unsafe<T[]>(sql, params as any[])
    : db.unsafe<T[]>(sql);
}

/**
 * Parse the :id path segment into a {pkColumn: value} map.
 * Supports both simple (/42) and composite (/42,7) PK values.
 */
function parsePkSegment(
  table: { primaryKeys: string[]; name: string },
  idSegment: string,
): Record<string, string> {
  const pks = table.primaryKeys;
  if (pks.length === 0) {
    throw new BadRequestException({
      error: `"${table.name}" has no primary key — use collection-level filtering instead`,
    });
  }

  const parts = idSegment.split(",");
  if (parts.length !== pks.length) {
    throw new BadRequestException({
      error: `"${table.name}" has a ${pks.length}-column primary key; provide ${pks.length} value(s) separated by commas`,
    });
  }

  return Object.fromEntries(pks.map((pk, i) => [pk, parts[i]]));
}

// ---------------------------------------------------------------------------
// Route plugin
// ---------------------------------------------------------------------------

export const rowRoutes = new Elysia({ prefix: "/:table/:id" })

  // -------------------------------------------------------------------------
  // GET /:table/:id — fetch one row
  // -------------------------------------------------------------------------
  .get(
    "/",
    async ({ params, request }) => {
      const schema = await SchemaService.get();
      const table = schema.tables.get(params.table);
      if (!table) throw new NotFoundException(`Relation "${params.table}" does not exist`);
      const pkValues = parsePkSegment(table, params.id);

      const urlParams = new URL(request.url).searchParams;
      let parsed;
      try {
        parsed = QueryParserService.parseQueryParams(urlParams, table);
      } catch (err) {
        throw new BadRequestException({
          error: "Invalid query parameters",
          message: err instanceof Error ? err.message : String(err),
        });
      }

      const built = QueryBuilderService.buildSelectByPk(table, pkValues, parsed, schema);
      if (!built) {
        throw new BadRequestException({
          error: `"${table.name}" has no primary key — use collection endpoint`,
        });
      }

      try {
        const rows = await run(built.sql, built.params);
        if (rows.length === 0) throw new NotFoundException(`Row not found in "${table.name}"`);
        return rows[0];
      } catch (err) {
        if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Query failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String(), id: t.String() }),
      response: t.Union([
        t.Any(),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Get row by PK",
        description: "Fetch a single row by its primary key. Supports ?select for column projection.",
        tags: ["REST"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // PUT /:table/:id — full replace (upsert-style, all fields)
  // -------------------------------------------------------------------------
  .put(
    "/",
    async ({ params, body }) => {
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

      const pkValues = parsePkSegment(table, params.id);

      try {
        const { sql, params: p } = QueryBuilderService.buildUpdateByPk(
          table,
          pkValues,
          body as Record<string, unknown>,
        );
        const rows = await run(sql, p);
        if (rows.length === 0) throw new NotFoundException(`Row not found in "${table.name}"`);
        return rows[0];
      } catch (err) {
        if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Update failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String(), id: t.String() }),
      body: t.Object({}, { additionalProperties: true }),
      response: t.Union([
        t.Any(),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Replace row by PK",
        description: "Full replacement update for a single row identified by its primary key.",
        tags: ["REST"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // PATCH /:table/:id — partial update
  // -------------------------------------------------------------------------
  .patch(
    "/",
    async ({ params, body }) => {
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

      const pkValues = parsePkSegment(table, params.id);

      try {
        const { sql, params: p } = QueryBuilderService.buildUpdateByPk(
          table,
          pkValues,
          body as Record<string, unknown>,
        );
        const rows = await run(sql, p);
        if (rows.length === 0) throw new NotFoundException(`Row not found in "${table.name}"`);
        return rows[0];
      } catch (err) {
        if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Update failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String(), id: t.String() }),
      body: t.Object({}, { additionalProperties: true }),
      response: t.Union([
        t.Any(),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Partial update row by PK",
        description: "Patch any subset of fields on a single row identified by its primary key.",
        tags: ["REST"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // DELETE /:table/:id — delete one row
  // -------------------------------------------------------------------------
  .delete(
    "/",
    async ({ params, set }) => {
      const table = await resolveTable(params.table);

      if (isReadOnly(table.tableType)) {
        throw new BadRequestException({
          error: "Read-only relation",
          message: `"${table.name}" is a ${table.tableType.toLowerCase()} and cannot be written to`,
        });
      }

      const pkValues = parsePkSegment(table, params.id);

      try {
        const { sql, params: p } = QueryBuilderService.buildDeleteByPk(table, pkValues);
        const rows = await run(sql, p);
        if (rows.length === 0) throw new NotFoundException(`Row not found in "${table.name}"`);
        set.status = 200;
        return rows[0];
      } catch (err) {
        if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException({
          error: "Delete failed",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    {
      params: t.Object({ table: t.String(), id: t.String() }),
      response: t.Union([
        t.Any(),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Delete row by PK",
        description: "Delete a single row identified by its primary key. Returns the deleted row.",
        tags: ["REST"],
      },
    },
  );
