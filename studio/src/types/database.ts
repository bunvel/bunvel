export type TableKind = 'TABLE' | 'VIEW' | 'MATERIALIZED VIEW' | (string & {})

export interface ColumnDefinition {
  name: string
  type: string
  nullable?: boolean
  defaultValue?: string
  isPrimaryKey?: boolean
  unique?: boolean
}

export interface Table {
  name: string
  kind: TableKind
  columns?: ColumnDefinition[]
}

export type ForeignKeyAction =
  | 'NO ACTION'
  | 'RESTRICT'
  | 'CASCADE'
  | 'SET NULL'
  | 'SET DEFAULT'

export interface ForeignKeyDefinition {
  column: string
  referencedTable: string
  referencedColumn: string
  onDelete: ForeignKeyAction
  onUpdate: ForeignKeyAction
}

export interface CreateTableParams {
  schema: string
  table: string
  description: string
  columns: ColumnDefinition[]
  foreignKeys?: ForeignKeyDefinition[]
}

export interface CreateRowParams {
  schema: string
  table: string
  row: Record<string, any>
}

export interface UpdateRowParams {
  schema: string
  table: string
  row: Record<string, any>
  primaryKeys: string[]
}

export interface DeleteTableParams {
  schema: string
  table: string
  cascade: boolean
}

export interface CreateIndexParams {
  schema: string
  table: string
  columns: string[]
  unique?: boolean
  indexType?: 'btree' | 'hash' | 'gist' | 'spgist' | 'gin' | 'brin'
}

export interface CreateEnumParams {
  schema: string
  enumName: string
  values: string[]
}

export interface DatabaseTables {
  oid: string
  name: string
  kind: TableKind
  description: string
  row_count: number
  total_size: string
  column_count: number
}

export interface DatabaseTableColumns {
  name: string
  description: string
  data_type: string
  nullable: string
  position: number
}

export interface DatabaseTableIndexes {
  table_name: string
  index_name: string
  column_name: string
  index_definition: string
}

export interface DatabaseEnum {
  enum_name: string
  schema_name: string
  enum_value: string
}

export interface DatabaseFunction {
  function_name: string
  return_type: string
  arguments: string
  security_type: 'SECURITY DEFINER' | 'SECURITY INVOKER'
  description: string | null
}

export interface DatabaseTrigger {
  trigger_name: string
  table_name: string
  function_name: string
  events: string
  orientation: 'ROW' | 'STATEMENT'
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF'
}

export interface Schema {
  schema_name: string
}
