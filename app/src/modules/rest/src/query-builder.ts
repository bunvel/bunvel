import type { ColumnInfo, TableInfo, SchemaCache } from "./schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectASTNode {
  type: "column" | "relation";
  name: string;
  alias?: string;
  children?: SelectASTNode[];
}

export interface ParsedQuery {
  /** AST nodes representing selected columns and embedded relations */
  select: SelectASTNode[];
  /** WHERE clause fragments + collected params */
  where: { sql: string; params: unknown[] };
  /** ORDER BY clause */
  orderBy: string;
  /** LIMIT value (0 = no limit) */
  limit: number;
  /** OFFSET value */
  offset: number;
}

export interface BuildResult {
  sql: string;
  params: unknown[];
}

// Operator map: URL token → SQL operator
const FILTER_OPS: Record<string, string> = {
  eq: "=",
  neq: "!=",
  lt: "<",
  lte: "<=",
  gt: ">",
  gte: ">=",
  like: "LIKE",
  ilike: "ILIKE",
  is: "IS",
  in: "IN",
  nin: "NOT IN",
  cs: "@>",   // jsonb / array contains
  cd: "<@",   // jsonb / array contained by
};

// Reserved query-string keys that are NOT filter columns
const RESERVED_KEYS = new Set([
  "select",
  "order",
  "limit",
  "offset",
  "count",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Safely double-quote a PostgreSQL identifier. */
export function quoteIdent(name: string): string {
  // Reject anything that isn't a safe identifier character
  if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(name)) {
    throw new Error(`Invalid identifier: "${name}"`);
  }
  return `"${name}"`;
}

/** Return the set of valid column names for a table. */
function columnSet(table: TableInfo): Set<string> {
  return new Set(table.columns.map((c) => c.name));
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a PostgREST-style `select` query-string value into validated column names.
 *
 * Supported formats:
 *   - `*` or omitted → select all
 *   - `col1,col2` → select named columns
 *   - `alias:col` → select col AS alias  (basic aliasing)
 */
function parseSelect(raw: string | null): SelectASTNode[] {
  if (!raw || raw.trim() === "*" || raw.trim() === "") return [];

  const tokens: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      tokens.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens.map(token => {
    const openParen = token.indexOf('(');
    if (openParen !== -1 && token.endsWith(')')) {
      const beforeParen = token.slice(0, openParen).trim();
      const insideParen = token.slice(openParen + 1, -1).trim();
      
      let alias: string | undefined;
      let name = beforeParen;
      const colonIdx = beforeParen.indexOf(':');
      if (colonIdx !== -1) {
        alias = beforeParen.slice(0, colonIdx).trim();
        name = beforeParen.slice(colonIdx + 1).trim();
      }
      
      return {
        type: "relation",
        name,
        alias,
        children: parseSelect(insideParen)
      };
    } else {
      let alias: string | undefined;
      let name = token;
      const colonIdx = token.indexOf(':');
      if (colonIdx !== -1) {
        alias = token.slice(0, colonIdx).trim();
        name = token.slice(colonIdx + 1).trim();
      }
      return {
        type: "column",
        name,
        alias
      };
    }
  });
}

/**
 * Parse `order=col.asc,col2.desc` into a safe ORDER BY clause string.
 */
function parseOrder(raw: string | null, table: TableInfo): string {
  if (!raw) return "";

  const valid = columnSet(table);
  const parts = raw.split(",").map((part) => {
    const segments = part.trim().split(".");
    const col = segments[0];
    const dir = (segments[1] ?? "asc").toLowerCase();
    const nulls = segments[2]?.toLowerCase(); // nullsfirst | nullslast

    if (!valid.has(col)) throw new Error(`Unknown column for order: "${col}"`);
    if (dir !== "asc" && dir !== "desc") throw new Error(`Invalid order direction: "${dir}"`);

    let clause = `${quoteIdent(col)} ${dir.toUpperCase()}`;
    if (nulls === "nullsfirst") clause += " NULLS FIRST";
    else if (nulls === "nullslast") clause += " NULLS LAST";
    return clause;
  });

  return parts.join(", ");
}

/**
 * Parse filter query-string params into a WHERE clause.
 *
 * PostgREST filter syntax:  `column=op.value`
 * Examples:
 *   price=gte.100
 *   name=ilike.*shirt*
 *   status=in.(PAID,SHIPPED)
 *   deleted_at=is.null
 */
function parseFilters(
  params: URLSearchParams,
  table: TableInfo,
): { sql: string; params: unknown[] } {
  const valid = columnSet(table);
  const colMap = new Map<string, ColumnInfo>(table.columns.map((c) => [c.name, c]));
  const fragments: string[] = [];
  const values: unknown[] = [];

  for (const [key, rawValue] of params.entries()) {
    if (RESERVED_KEYS.has(key)) continue;

    if (!valid.has(key)) {
      throw new Error(`Unknown filter column: "${key}"`);
    }

    // rawValue format: "op.value" or just a bare value (implicit eq)
    const dotIdx = rawValue.indexOf(".");
    let op: string;
    let val: string;

    if (dotIdx !== -1 && FILTER_OPS[rawValue.slice(0, dotIdx)] !== undefined) {
      op = rawValue.slice(0, dotIdx);
      val = rawValue.slice(dotIdx + 1);
    } else {
      op = "eq";
      val = rawValue;
    }

    const sqlOp = FILTER_OPS[op];
    if (!sqlOp) throw new Error(`Unknown filter operator: "${op}"`);

    const colInfo = colMap.get(key)!;
    const quotedCol = quoteIdent(key);
    const paramIndex = values.length + 1;

    if (op === "is") {
      // Only allow null / true / false for IS
      const lower = val.toLowerCase();
      if (lower === "null") {
        fragments.push(`${quotedCol} IS NULL`);
      } else if (lower === "true" || lower === "false") {
        fragments.push(`${quotedCol} IS ${lower.toUpperCase()}`);
      } else {
        throw new Error(`Invalid IS value: "${val}" (allowed: null, true, false)`);
      }
      continue;
    }

    if (op === "in" || op === "nin") {
      // Value format: (v1,v2,v3) — strip parens, split, cast
      const inner = val.replace(/^\(/, "").replace(/\)$/, "");
      const items = inner.split(",").map((v) => castValue(v.trim(), colInfo));
      if (items.length === 0) throw new Error(`Empty IN list for column "${key}"`);

      const placeholders = items.map((_, i) => `$${paramIndex + i}`).join(", ");
      fragments.push(`${quotedCol} ${sqlOp} (${placeholders})`);
      values.push(...items);
      continue;
    }

    if (op === "like" || op === "ilike") {
      // Allow * as wildcard (PostgREST convention)
      const pattern = val.replace(/\*/g, "%");
      fragments.push(`${quotedCol} ${sqlOp} $${paramIndex}`);
      values.push(pattern);
      continue;
    }

    // Default: cast and push
    const castedVal = castValue(val, colInfo);
    fragments.push(`${quotedCol} ${sqlOp} $${paramIndex}`);
    values.push(castedVal);
  }

  return {
    sql: fragments.length > 0 ? fragments.join(" AND ") : "",
    params: values,
  };
}

/**
 * Cast a string value from the URL to an appropriate JS type based on the
 * column's PostgreSQL type, so Bun's parameterized query sends the right wire type.
 */
function castValue(val: string, col: ColumnInfo): unknown {
  if (val === "null") return null;

  const t = col.type.toLowerCase();
  const udt = col.udtName.toLowerCase();

  // Booleans
  if (t === "boolean" || udt === "bool") {
    if (val === "true" || val === "t") return true;
    if (val === "false" || val === "f") return false;
    throw new Error(`Invalid boolean value: "${val}"`);
  }

  // Integers
  if (
    t.includes("int") ||
    t === "bigint" ||
    t === "smallint" ||
    udt.includes("int")
  ) {
    const n = Number(val);
    if (!Number.isInteger(n)) throw new Error(`Expected integer, got: "${val}"`);
    return n;
  }

  // Numerics / floats
  if (
    t === "numeric" ||
    t === "decimal" ||
    t === "real" ||
    t === "double precision" ||
    udt === "numeric" ||
    udt === "float4" ||
    udt === "float8"
  ) {
    const n = Number(val);
    if (Number.isNaN(n)) throw new Error(`Expected number, got: "${val}"`);
    return n;
  }

  // Dates / timestamps — pass as string, pg will coerce
  return val;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse URLSearchParams into a structured query description.
 */
export function parseQueryParams(
  params: URLSearchParams,
  table: TableInfo,
): ParsedQuery {
  const select = parseSelect(params.get("select"));
  const where = parseFilters(params, table);
  const orderBy = parseOrder(params.get("order"), table);

  const rawLimit = params.get("limit");
  const rawOffset = params.get("offset");

  let limit = rawLimit !== null ? parseInt(rawLimit, 10) : 100; // default page size
  let offset = rawOffset !== null ? parseInt(rawOffset, 10) : 0;

  if (!Number.isFinite(limit) || limit < 0) throw new Error(`Invalid limit: "${rawLimit}"`);
  if (!Number.isFinite(offset) || offset < 0) throw new Error(`Invalid offset: "${rawOffset}"`);

  // Hard cap at 1000 rows per request
  if (limit > 1000) limit = 1000;

  return { select, where, orderBy, limit, offset };
}

export function buildSelectClause(
  nodes: SelectASTNode[],
  table: TableInfo,
  schemaCache: SchemaCache,
  parentAlias: string
): string {
  if (nodes.length === 0) {
    return `${quoteIdent(parentAlias)}.*`;
  }
  const parts: string[] = [];
  const validCols = new Set(table.columns.map(c => c.name));

  for (const node of nodes) {
    if (node.type === "column") {
      if (node.name === "*") {
        parts.push(`${quoteIdent(parentAlias)}.*`);
      } else {
        if (!validCols.has(node.name)) {
          throw new Error(`Unknown column: "${node.name}" in table "${table.name}"`);
        }
        const colExpr = `${quoteIdent(parentAlias)}.${quoteIdent(node.name)}`;
        if (node.alias) {
          parts.push(`${colExpr} AS ${quoteIdent(node.alias)}`);
        } else {
          parts.push(colExpr);
        }
      }
    } else if (node.type === "relation") {
      const relationName = node.name;
      const targetTableInfo = schemaCache.tables.get(relationName);
      if (!targetTableInfo) {
         throw new Error(`Unknown relation: "${relationName}"`);
      }

      let fk = table.foreignKeys.find(fk => fk.foreignTableName === relationName);
      let isManyToOne = true;

      if (!fk) {
        fk = targetTableInfo.foreignKeys.find(fk => fk.foreignTableName === table.name);
        isManyToOne = false;
      }

      if (!fk) {
         throw new Error(`No foreign key found linking "${table.name}" and "${relationName}"`);
      }

      const targetAlias = `${relationName}`;
      const innerSelect = buildSelectClause(node.children || [], targetTableInfo, schemaCache, targetAlias);
      
      let joinCondition = "";
      if (isManyToOne) {
         joinCondition = `${quoteIdent(targetAlias)}.${quoteIdent(fk.foreignColumnName)} = ${quoteIdent(parentAlias)}.${quoteIdent(fk.columnName)}`;
      } else {
         joinCondition = `${quoteIdent(targetAlias)}.${quoteIdent(fk.columnName)} = ${quoteIdent(parentAlias)}.${quoteIdent(fk.foreignColumnName)}`;
      }

      const subqueryName = `${relationName}_sub`;
      const jsonFn = isManyToOne ? `row_to_json(${quoteIdent(subqueryName)}.*)` : `COALESCE(json_agg(row_to_json(${quoteIdent(subqueryName)}.*)), '[]'::json)`;
      
      const subquery = `(
        SELECT ${jsonFn}
        FROM (
          SELECT ${innerSelect}
          FROM ${quoteIdent(targetTableInfo.schema)}.${quoteIdent(targetTableInfo.name)} AS ${quoteIdent(targetAlias)}
          WHERE ${joinCondition}
        ) ${quoteIdent(subqueryName)}
      )`;
      
      const finalAlias = node.alias ? node.alias : relationName;
      parts.push(`${subquery} AS ${quoteIdent(finalAlias)}`);
    }
  }
  return parts.join(", ");
}

/**
 * Build a SELECT query from parsed params.
 */
export function buildSelect(
  table: TableInfo,
  parsed: ParsedQuery,
  schemaCache: SchemaCache,
  extraWhere?: { sql: string; param: unknown; paramOffset: number },
): BuildResult {
  const selectClause = buildSelectClause(parsed.select, table, schemaCache, table.name);

  const allParams: unknown[] = [...parsed.where.params];
  const whereParts: string[] = [];

  if (parsed.where.sql) {
    whereParts.push(parsed.where.sql);
  }

  if (extraWhere) {
    whereParts.push(extraWhere.sql);
    allParams.push(extraWhere.param);
  }

  let sql = `SELECT ${selectClause} FROM ${quoteIdent(table.schema)}.${quoteIdent(table.name)} AS ${quoteIdent(table.name)}`;

  if (whereParts.length > 0) {
    sql += ` WHERE ${whereParts.join(" AND ")}`;
  }

  if (parsed.orderBy) {
    sql += ` ORDER BY ${parsed.orderBy}`;
  }

  if (parsed.limit > 0) {
    sql += ` LIMIT ${parsed.limit}`;
  }

  if (parsed.offset > 0) {
    sql += ` OFFSET ${parsed.offset}`;
  }

  return { sql, params: allParams };
}

/**
 * Build a COUNT(*) query for the same filters (used for Content-Range header).
 */
export function buildCount(table: TableInfo, parsed: ParsedQuery): BuildResult {
  let sql = `SELECT COUNT(*) AS count FROM ${quoteIdent(table.schema)}.${quoteIdent(table.name)}`;
  if (parsed.where.sql) {
    sql += ` WHERE ${parsed.where.sql}`;
  }
  return { sql, params: parsed.where.params };
}

/**
 * Build a SELECT-by-PK query.
 * Returns null if the table has no primary key (views, mat-views).
 */
export function buildSelectByPk(
  table: TableInfo,
  pkValues: Record<string, string>,
  parsed: ParsedQuery,
  schemaCache: SchemaCache,
): BuildResult | null {
  if (table.primaryKeys.length === 0) return null;

  const selectClause = buildSelectClause(parsed.select, table, schemaCache, table.name);

  const params: unknown[] = [];
  const pkFragments = table.primaryKeys.map((pk) => {
    const col = table.columns.find((c) => c.name === pk)!;
    const val = castValue(pkValues[pk], col);
    params.push(val);
    return `${quoteIdent(pk)} = $${params.length}`;
  });

  let sql = `SELECT ${selectClause} FROM ${quoteIdent(table.schema)}.${quoteIdent(table.name)} AS ${quoteIdent(table.name)} WHERE ${pkFragments.join(" AND ")}`;
  sql += " LIMIT 1";

  return { sql, params };
}

/**
 * Build an INSERT statement with RETURNING *.
 */
export function buildInsert(
  table: TableInfo,
  body: Record<string, unknown>,
): BuildResult {
  const valid = columnSet(table);
  const cols: string[] = [];
  const params: unknown[] = [];

  for (const [col, val] of Object.entries(body)) {
    if (!valid.has(col)) throw new Error(`Unknown column: "${col}"`);
    cols.push(quoteIdent(col));
    params.push(val);
  }

  if (cols.length === 0) throw new Error("Insert body cannot be empty");

  const placeholders = params.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `INSERT INTO ${quoteIdent(table.schema)}.${quoteIdent(table.name)} (${cols.join(", ")}) VALUES (${placeholders}) RETURNING *`;

  return { sql, params };
}

/**
 * Build a bulk INSERT (array of objects). All objects must have the same keys.
 */
export function buildBulkInsert(
  table: TableInfo,
  rows: Record<string, unknown>[],
): BuildResult {
  if (rows.length === 0) throw new Error("Bulk insert body cannot be empty");

  const valid = columnSet(table);
  const cols = Object.keys(rows[0]).filter((c) => valid.has(c));
  if (cols.length === 0) throw new Error("No valid columns in insert body");

  const params: unknown[] = [];
  const valueSets = rows.map((row) => {
    const placeholders = cols.map((col) => {
      params.push(row[col] ?? null);
      return `$${params.length}`;
    });
    return `(${placeholders.join(", ")})`;
  });

  const quotedCols = cols.map(quoteIdent).join(", ");
  const sql = `INSERT INTO ${quoteIdent(table.schema)}.${quoteIdent(table.name)} (${quotedCols}) VALUES ${valueSets.join(", ")} RETURNING *`;

  return { sql, params };
}

/**
 * Build an UPDATE statement by PK with RETURNING *.
 */
export function buildUpdateByPk(
  table: TableInfo,
  pkValues: Record<string, string>,
  body: Record<string, unknown>,
): BuildResult {
  if (table.primaryKeys.length === 0)
    throw new Error(`Table "${table.name}" has no primary key — cannot update by PK`);

  const valid = columnSet(table);
  const params: unknown[] = [];

  const setClauses: string[] = [];
  for (const [col, val] of Object.entries(body)) {
    if (table.primaryKeys.includes(col)) continue; // skip PK columns in SET
    if (!valid.has(col)) throw new Error(`Unknown column: "${col}"`);
    params.push(val);
    setClauses.push(`${quoteIdent(col)} = $${params.length}`);
  }

  if (setClauses.length === 0) throw new Error("Update body has no settable columns");

  const pkFragments = table.primaryKeys.map((pk) => {
    const col = table.columns.find((c) => c.name === pk)!;
    params.push(castValue(pkValues[pk], col));
    return `${quoteIdent(pk)} = $${params.length}`;
  });

  const sql = `UPDATE ${quoteIdent(table.schema)}.${quoteIdent(table.name)} SET ${setClauses.join(", ")} WHERE ${pkFragments.join(" AND ")} RETURNING *`;

  return { sql, params };
}

/**
 * Build a bulk UPDATE matching URL filters (PATCH semantics — partial fields).
 */
export function buildUpdateByFilter(
  table: TableInfo,
  parsed: ParsedQuery,
  body: Record<string, unknown>,
): BuildResult {
  const valid = columnSet(table);
  const params: unknown[] = [];

  const setClauses: string[] = [];
  for (const [col, val] of Object.entries(body)) {
    if (table.primaryKeys.includes(col)) continue;
    if (!valid.has(col)) throw new Error(`Unknown column: "${col}"`);
    params.push(val);
    setClauses.push(`${quoteIdent(col)} = $${params.length}`);
  }

  if (setClauses.length === 0) throw new Error("Update body has no settable columns");

  // Re-number filter params after SET params
  let sql = `UPDATE ${quoteIdent(table.schema)}.${quoteIdent(table.name)} SET ${setClauses.join(", ")}`;

  if (parsed.where.sql) {
    // Shift param indices in the WHERE clause
    const offset = params.length;
    const shiftedWhere = parsed.where.sql.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + offset}`);
    sql += ` WHERE ${shiftedWhere}`;
    params.push(...parsed.where.params);
  }

  sql += " RETURNING *";

  return { sql, params };
}

/**
 * Build a DELETE by PK with RETURNING *.
 */
export function buildDeleteByPk(
  table: TableInfo,
  pkValues: Record<string, string>,
): BuildResult {
  if (table.primaryKeys.length === 0)
    throw new Error(`Table "${table.name}" has no primary key — cannot delete by PK`);

  const params: unknown[] = [];
  const pkFragments = table.primaryKeys.map((pk) => {
    const col = table.columns.find((c) => c.name === pk)!;
    params.push(castValue(pkValues[pk], col));
    return `${quoteIdent(pk)} = $${params.length}`;
  });

  const sql = `DELETE FROM ${quoteIdent(table.schema)}.${quoteIdent(table.name)} WHERE ${pkFragments.join(" AND ")} RETURNING *`;

  return { sql, params };
}

/**
 * Build a DELETE by filter with RETURNING *.
 */
export function buildDeleteByFilter(
  table: TableInfo,
  parsed: ParsedQuery,
): BuildResult {
  if (!parsed.where.sql) {
    throw new Error("Bulk delete requires at least one filter to prevent accidental full-table wipe");
  }

  const sql = `DELETE FROM ${quoteIdent(table.schema)}.${quoteIdent(table.name)} WHERE ${parsed.where.sql} RETURNING *`;

  return { sql, params: parsed.where.params };
}
