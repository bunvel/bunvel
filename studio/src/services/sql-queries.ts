// SQL queries for database metadata and operations

export const SQL_QUERIES = {
  // Get all non-system schemas
  GET_SCHEMAS: `
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1') 
    ORDER BY schema_name
  `,

  // Get all tables and views in a schema
  GET_TABLES: `
    SELECT 
      table_name, 
      table_schema,
      table_type
    FROM information_schema.tables 
    WHERE table_schema = $1 
    AND table_type IN ('BASE TABLE', 'VIEW')
    ORDER BY table_type, table_name
  `,

  // Get detailed table metadata including columns, primary keys, and foreign keys
  GET_TABLE_METADATA: `
    WITH 
    -- Get all columns for the table
    table_columns AS (
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.is_identity,
        c.is_updatable
      FROM 
        information_schema.columns c
      WHERE 
        c.table_schema = $1 
        AND c.table_name = $2
    ),
    -- Get primary key columns
    pk_columns AS (
      SELECT 
        a.attname as column_name
      FROM 
        pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE 
        n.nspname = $1 
        AND t.relname = $2
        AND i.indisprimary
    ),
    -- Get foreign key columns
    fk_columns AS (
      SELECT
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM 
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_catalog = kcu.constraint_catalog
          AND tc.constraint_schema = kcu.constraint_schema
          AND tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_catalog = ccu.constraint_catalog
          AND tc.constraint_schema = ccu.constraint_schema
          AND tc.constraint_name = ccu.constraint_name
      WHERE 
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
    )
    
    SELECT 
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      c.is_identity,
      c.is_updatable,
      CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
      CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
      fk.foreign_table_schema,
      fk.foreign_table_name,
      fk.foreign_column_name
    FROM 
      table_columns c
      LEFT JOIN pk_columns pk ON c.column_name = pk.column_name
      LEFT JOIN fk_columns fk ON c.column_name = fk.column_name
    ORDER BY c.column_name
  `,

  // Get primary keys for a table
  GET_PRIMARY_KEYS: `
    SELECT 
      kcu.column_name
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_catalog = kcu.constraint_catalog
        AND tc.constraint_schema = kcu.constraint_schema
        AND tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_catalog = ccu.constraint_catalog
        AND tc.constraint_schema = ccu.constraint_schema
        AND tc.constraint_name = ccu.constraint_name
    WHERE 
      tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = $1 
      AND tc.table_name = $2
  `,

  // Get foreign keys for a table
  GET_FOREIGN_KEYS: `
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM 
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_catalog = kcu.constraint_catalog
        AND tc.constraint_schema = kcu.constraint_schema
        AND tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON tc.constraint_catalog = ccu.constraint_catalog
        AND tc.constraint_schema = ccu.constraint_schema
        AND tc.constraint_name = ccu.constraint_name
    WHERE 
      tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = $1
      AND tc.table_name = $2
  `
} as const;

export type SqlQueryKey = keyof typeof SQL_QUERIES;