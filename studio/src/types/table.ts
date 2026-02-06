import type { FilterOperator } from '@/constants/filter'

export type TableRow = Record<string, unknown>

export interface FilterConfig {
  id: string
  column: string
  operator: FilterOperator
  value: string | number | boolean | null
}

export interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
}

export interface PaginationConfig {
  pageIndex: number
  pageSize: number
}

export interface TableState {
  selectedRows: Array<TableRow>
  rowSelection: Record<string, boolean>
  pagination: PaginationConfig
  sorts: Array<SortConfig>
  filters: Array<FilterConfig>
}

export interface TableTabsState {
  selectedTables: Array<string>
  maxTabs: number
  activeTableKey: string | null
}

export interface ColumnMetadata {
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
  column_default: string | null
  is_identity: 'YES' | 'NO'
  is_updatable: 'YES' | 'NO'
  is_primary_key: boolean
  is_foreign_key: boolean
  foreign_table_schema?: string
  foreign_table_name?: string
  foreign_column_name?: string
}

export interface ForeignKey {
  constraint_name: string
  column_name: string
  foreign_table_schema: string
  foreign_table_name: string
  foreign_column_name: string
}

export interface TableMetadata {
  columns: Array<ColumnMetadata>
  primary_keys: Array<string>
  foreign_keys: Array<ForeignKey>
  table_type: 'r' | 'v' | 'm'
}

export interface TableDataResult {
  data: Array<Record<string, any>>
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TableDataParams {
  schema: string
  table: string
  page: number
  pageSize: number
  sorts?: Array<SortConfig>
  filters?: Array<FilterConfig>
  primaryKeys?: Array<string>
  firstColumnName?: string
}

export interface TableMetadataResult {
  data: TableMetadata
}

export interface DeleteRowsParams {
  schema: string
  table: string
  primaryKeys: Array<string>
  rows: Array<Record<string, any>>
}
