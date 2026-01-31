// SQL queries for database metadata and operations
export const SQL_QUERIES = {
  // Get all triggers for a specific schema
  GET_TRIGGERS: `
    SELECT
      t.tgname AS trigger_name,
      c.relname AS table_name,
      p.proname AS function_name,
      CASE
        WHEN t.tgtype::integer & 4 > 0 THEN 'INSERT'
        WHEN t.tgtype::integer & 8 > 0 THEN 'DELETE'
        WHEN t.tgtype::integer & 16 > 0 THEN 'UPDATE'
        WHEN t.tgtype::integer & 32 > 0 THEN 'TRUNCATE'
        ELSE 'UNKNOWN'
      END AS events,
      CASE
        WHEN t.tgtype::integer & 1 > 0 THEN 'ROW'
        ELSE 'STATEMENT'
      END AS orientation,
      CASE
        WHEN t.tgtype::integer & 2 > 0 THEN 'BEFORE'
        WHEN t.tgtype::integer & 64 > 0 THEN 'INSTEAD OF'
        ELSE 'AFTER'
      END AS timing
    FROM
      pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_proc p ON t.tgfoid = p.oid
      JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE
      NOT t.tgisinternal
      AND n.nspname = $1
    ORDER BY
      c.relname,
      t.tgname;
  `,
  // Get all functions for a specific schema
  GET_FUNCTIONS: `
    SELECT
      p.proname AS function_name,
      pg_catalog.pg_get_function_result(p.oid) AS return_type,
      pg_catalog.pg_get_function_arguments(p.oid) AS arguments,
      CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
      END AS security_type,
      pg_catalog.obj_description(p.oid, 'pg_proc') AS description
    FROM
      pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      LEFT JOIN pg_catalog.pg_depend d ON p.oid = d.objid AND d.deptype = 'e'
    WHERE
      n.nspname = $1
      AND d.objid IS NULL  -- Exclude functions from extensions
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND n.nspname NOT LIKE 'pg_%'
    ORDER BY
      p.proname;
  `,

  // Get all enum types and their values
  GET_ENUMS: `
    SELECT
      t.typname AS enum_name,
      n.nspname AS schema_name,
      e.enumlabel AS enum_value
    FROM
      pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE
      n.nspname = $1
    ORDER BY
      t.typname,
      e.enumsortorder;
  `,
  // Get all non-system schemas
  GET_ALL_SCHEMAS: `
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

  // Get all tables and views in a schema with basic info
  GET_ALL_TABLES: `
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

  // Get detailed table information including description, row count, size, and column count
  GET_DATABASE_TABLES: `
    SELECT
      c.oid, 
      c.relname AS name,
      obj_description(c.oid) AS description,
      COALESCE(pg_stat_get_live_tuples(c.oid), 0)::bigint AS row_count,
      pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
      (
        SELECT count(*)
        FROM pg_attribute a
        WHERE a.attrelid = c.oid
        AND a.attnum > 0
        AND NOT a.attisdropped
      ) AS column_count,
      CASE c.relkind
        WHEN 'r' THEN 'TABLE'
        WHEN 'v' THEN 'VIEW'
        WHEN 'm' THEN 'MATERIALIZED VIEW'
      END AS kind
    FROM 
      pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE 
      n.nspname = $1
      AND c.relkind IN ('r', 'v', 'm')
      AND NOT c.relispartition
    ORDER BY 
      c.relname;
  `,

  GET_TABLE_COLUMNS: `
  SELECT
    a.attname AS name,
    pg_catalog.col_description(c.oid, a.attnum) AS description,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
    NOT a.attnotnull AS nullable
  FROM
    pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
  WHERE
    c.oid = $1
    AND a.attnum > 0
    AND NOT a.attisdropped
  ORDER BY
    a.attnum;
`,

  // Get all indexes by schema
  GET_TABLE_INDEXES: `
    SELECT
      t.relname AS table_name,
      i.relname AS index_name,
      a.attname AS column_name,
      pg_get_indexdef(i.oid) AS index_definition
    FROM
      pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE
      n.nspname = $1
    ORDER BY
      t.relname,
      i.relname;
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
      o.relkind AS table_type,
      (pk.column_name IS NOT NULL) AS is_primary_key,
      (fk.column_name IS NOT NULL) AS is_foreign_key,
      fk.foreign_table_schema,
      fk.foreign_table_name,
      fk.foreign_column_name
    FROM 
      columns c
      JOIN object o ON true
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
  `,
} as const
