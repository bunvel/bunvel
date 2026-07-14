/**
 * Schema discovery endpoints
 *
 *  GET /rest/          – list all exposed tables/views with column metadata
 *  GET /rest/:table/   – column metadata for a specific table/view
 *  POST /rest/_schema/refresh – force-invalidate the schema cache
 */

import Elysia, { t } from "elysia";
import { NotFoundException } from "elysia-http-exception";
import { SchemaService } from "../services/schema.service";

export const schemaRoutes = new Elysia()

  // -------------------------------------------------------------------------
  // GET /  — list all relations
  // -------------------------------------------------------------------------
  .get(
    "/",
    async () => {
      const { tables, fetchedAt } = await SchemaService.get();
      const relations = [...tables.values()].map((t) => ({
        name: t.name,
        schema: t.schema,
        type: t.tableType,
        primaryKeys: t.primaryKeys,
        columns: t.columns.map((c) => ({
          name: c.name,
          type: c.type,
          udtName: c.udtName,
          nullable: c.isNullable,
          primaryKey: c.isPrimaryKey,
          hasDefault: c.hasDefault,
        })),
      }));

      return {
        relations,
        cachedAt: new Date(fetchedAt).toISOString(),
        count: relations.length,
      };
    },
    {
      response: t.Union([
        t.Object({
          relations: t.Array(t.Any()),
          cachedAt: t.String(),
          count: t.Number(),
        }),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "List all relations",
        description:
          "Returns all exposed tables, views and materialized views along with their column metadata.",
        tags: ["REST / Schema"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // POST /_schema/refresh — invalidate schema cache
  // -------------------------------------------------------------------------
  .post(
    "/_schema/refresh",
    async () => {
      SchemaService.invalidate();
      const { tables, fetchedAt } = await SchemaService.get(true);
      return {
        message: "Schema cache refreshed",
        relations: tables.size,
        cachedAt: new Date(fetchedAt).toISOString(),
      };
    },
    {
      response: t.Object({
        message: t.String(),
        relations: t.Number(),
        cachedAt: t.String(),
      }),
      detail: {
        summary: "Refresh schema cache",
        description: "Force re-introspect the database schema. Useful after DDL changes.",
        tags: ["REST / Schema"],
      },
    },
  )

  // -------------------------------------------------------------------------
  // GET /:table/  — single relation metadata  (note trailing slash to avoid
  //                 clashing with /:table/:id)
  // -------------------------------------------------------------------------
  .get(
    "/:table/columns",
    async ({ params }) => {
      const { tables } = await SchemaService.get();
      const table = tables.get(params.table);
      if (!table) throw new NotFoundException(`Relation "${params.table}" does not exist`);

      return {
        name: table.name,
        schema: table.schema,
        type: table.tableType,
        primaryKeys: table.primaryKeys,
        columns: table.columns.map((c) => ({
          name: c.name,
          type: c.type,
          udtName: c.udtName,
          nullable: c.isNullable,
          primaryKey: c.isPrimaryKey,
          hasDefault: c.hasDefault,
          maxLength: c.maxLength,
        })),
      };
    },
    {
      params: t.Object({ table: t.String() }),
      response: t.Union([
        t.Any(),
        t.Object({
          statusCode: t.Number(),
          error: t.Optional(t.String()),
          message: t.Optional(t.Union([t.String(), t.Any()])),
        }),
      ]),
      detail: {
        summary: "Get relation columns",
        description: "Returns full column metadata for a specific table or view.",
        tags: ["REST / Schema"],
      },
    },
  );
