/**
 * REST Service — in-process PostgREST replacement
 *
 * Exposes auto-generated CRUD endpoints for every table, view and materialized
 * view in the connected PostgreSQL database, with no external container needed.
 *
 * Route summary (all under /rest prefix):
 *
 *   GET    /rest/                      – list all relations + column metadata
 *   POST   /rest/_schema/refresh       – invalidate the schema cache
 *   GET    /rest/:table/columns        – column metadata for one relation
 *
 *   GET    /rest/:table                – list rows  (?select, ?order, ?limit, ?offset, filters)
 *   POST   /rest/:table                – insert one row or an array of rows
 *   PATCH  /rest/:table                – bulk update rows matching URL filters
 *   DELETE /rest/:table                – bulk delete rows matching URL filters (filter required)
 *
 *   GET    /rest/:table/:id            – fetch one row by PK
 *   PUT    /rest/:table/:id            – full replace by PK
 *   PATCH  /rest/:table/:id            – partial update by PK
 *   DELETE /rest/:table/:id            – delete one row by PK
 *
 * Filter syntax (PostgREST-compatible):
 *   ?column=op.value
 *   Operators: eq neq lt lte gt gte like ilike is in nin cs cd
 *
 * Examples:
 *   GET /rest/products?price=gte.100&order=price.desc&limit=20
 *   GET /rest/orders?status=in.(PAID,SHIPPED)&select=id,total,status
 *   GET /rest/products/7?select=id,name,price
 *   PATCH /rest/orders/3  { "status": "SHIPPED" }
 *   DELETE /rest/products?category_id=eq.5
 */

import Elysia from "elysia";
import { rowRoutes } from "./src/routes/row.routes";
import { schemaRoutes } from "./src/routes/schema.routes";
import { tableRoutes } from "./src/routes/table.routes";

export const restService = new Elysia({
  name: "Rest Service",
  prefix: "/rest",
  detail: {
    description:
      "Auto-generated REST API — full CRUD over every PostgreSQL table, view and materialized view, with schema introspection and PostgREST-compatible filter syntax.",
  },
})
  // Schema discovery must come first so /  and /_schema/refresh
  // are matched before the dynamic /:table wildcard.
  .use(schemaRoutes)

  // Single-row routes must come before collection routes so that
  // /:table/:id is matched before /:table for two-segment paths.
  .use(rowRoutes)

  // Collection-level routes (/:table)
  .use(tableRoutes);
