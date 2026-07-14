import { db } from "../../../core/database";

import type { ColumnInfo, ForeignKeyInfo, TableInfo, SchemaCache } from "../types/rest.types";

export abstract class SchemaService {
  private static cache: SchemaCache | null = null;
  private static readonly CACHE_TTL_MS = 60_000;

  /**
   * Returns all user-accessible tables, views and materialized views from the
   * connected database, with full column metadata. Results are cached for 60 s.
   */
  static async get(forceRefresh = false): Promise<SchemaCache> {
    const now = Date.now();
    if (!forceRefresh && this.cache && now - this.cache.fetchedAt < this.CACHE_TTL_MS) {
      return this.cache;
    }

  // --- 1. Base tables & views from information_schema ---
  const tableRows = await db.unsafe<
    { table_schema: string; table_name: string; table_type: string }[]
  >(`
    SELECT table_schema, table_name, table_type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_toast','auth','drizzle')
      AND table_type IN ('BASE TABLE','VIEW')
    ORDER BY table_schema, table_name
  `);

  // --- 2. Materialized views from pg_catalog ---
  const matViewRows = await db.unsafe<
    { schemaname: string; matviewname: string }[]
  >(`
    SELECT schemaname, matviewname
    FROM pg_matviews
    WHERE schemaname NOT IN ('pg_catalog','information_schema','pg_toast','auth','drizzle')
    ORDER BY schemaname, matviewname
  `);

  // --- 3. Column metadata ---
  const columnRows = await db.unsafe<
    {
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      udt_name: string;
      is_nullable: string;
      column_default: string | null;
      character_maximum_length: number | null;
    }[]
  >(`
    SELECT
      c.table_schema,
      c.table_name,
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      c.character_maximum_length
    FROM information_schema.columns c
    WHERE c.table_schema NOT IN ('pg_catalog','information_schema','pg_toast','auth','drizzle')
    ORDER BY c.table_schema, c.table_name, c.ordinal_position
  `);

  // Materialized view columns come from pg_attribute
  const matViewColRows = await db.unsafe<
    {
      schemaname: string;
      matviewname: string;
      attname: string;
      typname: string;
      attnotnull: boolean;
      atthasdef: boolean;
    }[]
  >(`
    SELECT
      n.nspname  AS schemaname,
      c.relname  AS matviewname,
      a.attname,
      t.typname,
      a.attnotnull,
      a.atthasdef
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE c.relkind = 'm'
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND n.nspname NOT IN ('pg_catalog','information_schema','pg_toast','auth','drizzle')
    ORDER BY n.nspname, c.relname, a.attnum
  `);

  // --- 4. Primary key columns ---
  const pkRows = await db.unsafe<
    { table_schema: string; table_name: string; column_name: string }[]
  >(`
    SELECT
      kcu.table_schema,
      kcu.table_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema   = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema NOT IN ('pg_catalog','information_schema','pg_toast','auth','drizzle')
  `);

  // Build a fast lookup set for PKs: "schema.table.column"
  const pkSet = new Set<string>(
    pkRows.map((r: { table_schema: string; table_name: string; column_name: string }) =>
      `${r.table_schema}.${r.table_name}.${r.column_name}`,
    ),
  );

  // --- 5. Foreign key columns ---
  const fkRows = await db.unsafe<
    {
      table_schema: string;
      table_name: string;
      column_name: string;
      constraint_name: string;
      foreign_table_schema: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }[]
  >(`
    SELECT
      tc.table_schema,
      tc.table_name,
      kcu.column_name,
      tc.constraint_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema NOT IN ('pg_catalog','information_schema','pg_toast','auth','drizzle')
  `);

  const fkByTable = new Map<string, ForeignKeyInfo[]>();
  for (const row of fkRows) {
    const key = `${row.table_schema}.${row.table_name}`;
    if (!fkByTable.has(key)) fkByTable.set(key, []);
    fkByTable.get(key)!.push({
      constraintName: row.constraint_name,
      columnName: row.column_name,
      foreignTableSchema: row.foreign_table_schema,
      foreignTableName: row.foreign_table_name,
      foreignColumnName: row.foreign_column_name,
    });
  }

  // Group columns by table key
  const colsByTable = new Map<string, ColumnInfo[]>();

  for (const row of columnRows) {
    const key = `${row.table_schema}.${row.table_name}`;
    const col: ColumnInfo = {
      name: row.column_name,
      type: row.data_type,
      udtName: row.udt_name,
      isNullable: row.is_nullable === "YES",
      isPrimaryKey: pkSet.has(`${row.table_schema}.${row.table_name}.${row.column_name}`),
      hasDefault: row.column_default !== null,
      maxLength: row.character_maximum_length,
    };
    if (!colsByTable.has(key)) colsByTable.set(key, []);
    colsByTable.get(key)!.push(col);
  }

  for (const row of matViewColRows) {
    const key = `${row.schemaname}.${row.matviewname}`;
    const col: ColumnInfo = {
      name: row.attname,
      type: row.typname,
      udtName: row.typname,
      isNullable: !row.attnotnull,
      isPrimaryKey: false, // mat-views have no PK constraint
      hasDefault: row.atthasdef,
      maxLength: null,
    };
    if (!colsByTable.has(key)) colsByTable.set(key, []);
    colsByTable.get(key)!.push(col);
  }

  // Assemble final map
  const tables = new Map<string, TableInfo>();

  for (const row of tableRows) {
    const key = `${row.table_schema}.${row.table_name}`;
    const columns = colsByTable.get(key) ?? [];
    const foreignKeys = fkByTable.get(key) ?? [];
    tables.set(row.table_name, {
      name: row.table_name,
      schema: row.table_schema,
      tableType: row.table_type as "BASE TABLE" | "VIEW",
      columns,
      primaryKeys: columns.filter((c) => c.isPrimaryKey).map((c) => c.name),
      foreignKeys,
    });
  }

  for (const row of matViewRows) {
    const key = `${row.schemaname}.${row.matviewname}`;
    const columns = colsByTable.get(key) ?? [];
    tables.set(row.matviewname, {
      name: row.matviewname,
      schema: row.schemaname,
      tableType: "MATERIALIZED VIEW",
      columns,
      primaryKeys: [],
      foreignKeys: [],
    });
  }

    this.cache = { tables, fetchedAt: now };
    return this.cache;
  }

  /** Invalidate the schema cache (called after DDL mutations). */
  static invalidate(): void {
    this.cache = null;
  }
}
