import type { FilterOperator } from '@/utils/constant'

export type TableRow = Record<string, unknown>

export interface FilterConfig {
  column: string
  operator: FilterOperator
  value: string
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
  selectedRows: TableRow[]
  rowSelection: Record<string, boolean>
  pagination: PaginationConfig
  sorts: SortConfig[]
  filters: FilterConfig[]
}

export interface TableTabsState {
  selectedTables: string[]
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

export interface TableMetadata {
  columns: ColumnMetadata[]
  primary_keys: string[]
  foreign_keys: Array<{
    constraint_name: string
    column_name: string
    foreign_table_schema: string
    foreign_table_name: string
    foreign_column_name: string
  }>
  table_type: 'r' | 'v' | 'm'
}

export interface TableDataResult {
  data: Record<string, any>[]
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
  sorts?: SortConfig[]
  filters?: FilterConfig[]
  primaryKeys?: string[]
  firstColumnName?: string
}

export interface TableMetadataResult {
  data: TableMetadata
}
