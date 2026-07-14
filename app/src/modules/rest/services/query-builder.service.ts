import type { BuildResult, ParsedQuery, SelectASTNode, SchemaCache, TableInfo } from "../types/rest.types";
import { quoteIdent, castValue, columnSet } from "../utils/query-utils";

export abstract class QueryBuilderService {

  static buildSelectClause(
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
      const innerSelect = QueryBuilderService.buildSelectClause(node.children || [], targetTableInfo, schemaCache, targetAlias);
      
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
  static buildSelect(
  table: TableInfo,
  parsed: ParsedQuery,
  schemaCache: SchemaCache,
  extraWhere?: { sql: string; param: unknown; paramOffset: number },
): BuildResult {
    const selectClause = QueryBuilderService.buildSelectClause(parsed.select, table, schemaCache, table.name);

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
  static buildCount(table: TableInfo, parsed: ParsedQuery): BuildResult {
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
  static buildSelectByPk(
  table: TableInfo,
  pkValues: Record<string, string>,
  parsed: ParsedQuery,
  schemaCache: SchemaCache,
): BuildResult | null {
  if (table.primaryKeys.length === 0) return null;

    const selectClause = QueryBuilderService.buildSelectClause(parsed.select, table, schemaCache, table.name);

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
  static buildInsert(
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
  static buildBulkInsert(
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

    const quotedCols = cols.map(c => quoteIdent(c)).join(", ");
    const sql = `INSERT INTO ${quoteIdent(table.schema)}.${quoteIdent(table.name)} (${quotedCols}) VALUES ${valueSets.join(", ")} RETURNING *`;

  return { sql, params };
}

  /**
   * Build an UPDATE statement by PK with RETURNING *.
   */
  static buildUpdateByPk(
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
  static buildUpdateByFilter(
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
  static buildDeleteByPk(
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
  static buildDeleteByFilter(
  table: TableInfo,
  parsed: ParsedQuery,
): BuildResult {
  if (!parsed.where.sql) {
    throw new Error("Bulk delete requires at least one filter to prevent accidental full-table wipe");
  }

    const sql = `DELETE FROM ${quoteIdent(table.schema)}.${quoteIdent(table.name)} WHERE ${parsed.where.sql} RETURNING *`;

  return { sql, params: parsed.where.params };
}
}
