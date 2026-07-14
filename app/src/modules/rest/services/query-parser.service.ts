import type { ColumnInfo, ParsedQuery, SelectASTNode, TableInfo } from "../types/rest.types";
import { castValue, columnSet, quoteIdent } from "../utils/query-utils";

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

export abstract class QueryParserService {
  /**
   * Parse a PostgREST-style `select` query-string value into validated column names.
   */
  static parseSelect(raw: string | null): SelectASTNode[] {
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
          children: this.parseSelect(insideParen)
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
  static parseOrder(raw: string | null, table: TableInfo): string {
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
   */
  static parseFilters(
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
   * Parse URLSearchParams into a structured query description.
   */
  static parseQueryParams(
    params: URLSearchParams,
    table: TableInfo,
  ): ParsedQuery {
    const select = this.parseSelect(params.get("select"));
    const where = this.parseFilters(params, table);
    const orderBy = this.parseOrder(params.get("order"), table);

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
}
