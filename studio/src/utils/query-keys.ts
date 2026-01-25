// Query operation keys for debugging purposes
export const QUERY_OPERATION_KEYS = {
  // Schema operations
  GET_SCHEMAS: 'schema-list',
  CREATE_SCHEMA: 'create-schema',

  // Table operations
  GET_TABLES: 'table-list',
  GET_TABLE_METADATA: 'table-metadata',
  GET_TABLE_DATA: 'table-data',
  CREATE_TABLE: 'create-table',
  DELETE_TABLE: 'delete-table',
  UPDATE_TABLE: 'update-table',

  // Database structure operations
  GET_DATABASE_TABLES: 'database-tables',
  GET_TABLE_COLUMNS: 'table-columns',
  GET_DATABASE_INDEXES: 'database-indexes',
  GET_DATABASE_ENUMS: 'database-enums',
  GET_DATABASE_FUNCTIONS: 'database-functions',
  GET_DATABASE_TRIGGERS: 'database-triggers',
  CREATE_INDEX: 'create-index',

  // Row operations
  CREATE_ROW: 'create-row',
  UPDATE_ROW: 'update-row',
  DELETE_ROWS: 'delete-rows',
  TRUNCATE_TABLE: 'truncate-table',

  // Custom SQL operations
  EXECUTE_SQL: 'execute-sql',
} as const

export type QueryOperationKey =
  (typeof QUERY_OPERATION_KEYS)[keyof typeof QUERY_OPERATION_KEYS]
