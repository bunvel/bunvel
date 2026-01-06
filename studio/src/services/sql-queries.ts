// SQL queries for database metadata and operations
export const SQL_QUERIES = {
  // Get all non-system schemas
  GET_SCHEMAS: `
    SELECT 
      n.nspname AS schema_name
    FROM 
      pg_namespace n
    WHERE 
      n.nspname NOT LIKE 'pg_%'
      AND n.nspname <> 'information_schema'
    ORDER BY 
      n.nspname;
  `,

  // Get all tables and views in a schema
  GET_TABLES: `
    SELECT 
      CASE c.relkind
        WHEN 'r' THEN 'TABLE'
        WHEN 'v' THEN 'VIEW'
        WHEN 'm' THEN 'MATERIALIZED VIEW'
      END AS kind,
      c.relname AS name
    FROM 
      pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE 
      n.nspname = $1
      AND c.relkind IN ('r', 'v', 'm')
      AND NOT c.relispartition
    ORDER BY 
      kind, 
      name;
  `,

  // Get detailed table metadata including columns, primary keys, and foreign keys
  GET_TABLE_METADATA: `
    WITH object AS (
      SELECT
        c.oid,
        c.relkind
      FROM 
        pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE 
        n.nspname = $1
        AND c.relname = $2
        AND c.relkind IN ('r', 'v', 'm')
    ),
    columns AS (
      SELECT
        a.attname AS column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
        NOT a.attnotnull AS is_nullable,
        pg_get_expr(ad.adbin, ad.adrelid) AS column_default,
        a.attidentity != '' AS is_identity,
        (o.relkind = 'r') AS is_updatable,
        a.attnum
      FROM 
        pg_attribute a
        JOIN object o ON o.oid = a.attrelid
        LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
      WHERE 
        a.attnum > 0
        AND NOT a.attisdropped
    ),
    primary_keys AS (
      SELECT
        a.attname AS column_name
      FROM 
        pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
        JOIN object o ON o.oid = c.conrelid
      WHERE 
        c.contype = 'p'
    ),
    foreign_keys AS (
      SELECT
        a.attname AS column_name,
        fn.nspname AS foreign_table_schema,
        fc.relname AS foreign_table_name,
        fa.attname AS foreign_column_name
      FROM 
        pg_constraint c
        JOIN object o ON o.oid = c.conrelid
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
        JOIN pg_class fc ON fc.oid = c.confrelid
        JOIN pg_namespace fn ON fn.oid = fc.relnamespace
        JOIN pg_attribute fa ON fa.attrelid = c.confrelid AND fa.attnum = ANY (c.confkey)
      WHERE 
        c.contype = 'f'
    )
    SELECT
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      c.is_identity,
      c.is_updatable,
      (pk.column_name IS NOT NULL) AS is_primary_key,
      (fk.column_name IS NOT NULL) AS is_foreign_key,
      fk.foreign_table_schema,
      fk.foreign_table_name,
      fk.foreign_column_name
    FROM 
      columns c
      LEFT JOIN primary_keys pk USING (column_name)
      LEFT JOIN foreign_keys fk USING (column_name)
    ORDER BY 
      c.attnum;
  `,

  // Get primary keys for a table
  GET_PRIMARY_KEYS: `
    SELECT
      a.attname AS column_name
    FROM 
      pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
    WHERE 
      c.contype = 'p'
      AND n.nspname = $1
      AND t.relname = $2
    ORDER BY 
      array_position(c.conkey, a.attnum);
  `,

  // Get foreign keys for a table
  GET_FOREIGN_KEYS: `
    SELECT
      c.conname AS constraint_name,
      a.attname AS column_name,
      fn.nspname AS foreign_table_schema,
      ft.relname AS foreign_table_name,
      fa.attname AS foreign_column_name,
      c.confupdtype AS on_update,
      c.confdeltype AS on_delete
    FROM 
      pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
      JOIN pg_class ft ON ft.oid = c.confrelid
      JOIN pg_namespace fn ON fn.oid = ft.relnamespace
      JOIN pg_attribute fa ON fa.attrelid = ft.oid AND fa.attnum = ANY (c.confkey)
    WHERE 
      c.contype = 'f'
      AND n.nspname = $1
      AND t.relname = $2
    ORDER BY 
      c.conname, 
      array_position(c.conkey, a.attnum);
  `
} as const;

export type SqlQueryKey = keyof typeof SQL_QUERIES;
