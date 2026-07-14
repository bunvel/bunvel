import type { ColumnInfo, TableInfo } from "../types/rest.types";

/**
 * Safely double-quote a PostgreSQL identifier.
 */
export function quoteIdent(name: string): string {
  // Reject anything that isn't a safe identifier character
  if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(name)) {
    throw new Error(`Invalid identifier: "${name}"`);
  }
  return `"${name}"`;
}

/**
 * Return the set of valid column names for a table.
 */
export function columnSet(table: TableInfo): Set<string> {
  return new Set(table.columns.map((c) => c.name));
}

/**
 * Cast a string value from the URL to an appropriate JS type based on the
 * column's PostgreSQL type, so Bun's parameterized query sends the right wire type.
 */
export function castValue(val: string, col: ColumnInfo): unknown {
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
