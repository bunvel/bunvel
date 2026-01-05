import { DEFAULT_PAGE_SIZE } from '@/utils/constant'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'

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
}

export interface TableDataResult {
  data: Record<string, any>[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Define possible filter value types
type FilterValue = string | number | boolean | null | undefined

// Define the filters type with string keys and FilterValue values
type Filters = Record<string, FilterValue>

export type SortDirection = 'asc' | 'desc'

export interface TableDataParams {
  schema: string
  table: string
  page: number
  pageSize: number
  sortBy?: string
  sortDirection?: SortDirection
  filters?: Filters
  primaryKeys?: string[]
  firstColumnName?: string
}

export interface TableMetadataResult {
  data: TableMetadata
}

export interface TableMetadataParams {
  schema: string
  table: string
}

export const getTableMetadata = createServerFn({ method: 'POST' })
  .inputValidator((d: TableMetadataParams) => d)
  .handler(async ({ data }) => {
    try {
      // Fetch table metadata
      const metadataResponse = await apiClient.post<
        Array<{
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
        }>
      >('/meta/query/parameterized', {
        query: SQL_QUERIES.GET_TABLE_METADATA,
        params: [data.schema, data.table],
      })

      const columns: ColumnMetadata[] = metadataResponse.data.map((column) => ({
        column_name: column.column_name,
        data_type: column.data_type,
        is_nullable: column.is_nullable,
        column_default: column.column_default,
        is_identity: column.is_identity,
        is_updatable: column.is_updatable,
        is_primary_key: column.is_primary_key,
        is_foreign_key: column.is_foreign_key,
        foreign_table_schema: column.foreign_table_schema,
        foreign_table_name: column.foreign_table_name,
        foreign_column_name: column.foreign_column_name,
      }))

      // Fetch primary keys
      const primaryKeysResponse = await apiClient.post<
        Array<{ column_name: string }>
      >('/meta/query/parameterized', {
        query: SQL_QUERIES.GET_PRIMARY_KEYS,
        params: [data.schema, data.table],
      })

      const primaryKeys = primaryKeysResponse.data.map((pk) => pk.column_name)

      // Fetch foreign keys
      const foreignKeysResponse = await apiClient.post<
        Array<{
          constraint_name: string
          column_name: string
          foreign_table_schema: string
          foreign_table_name: string
          foreign_column_name: string
        }>
      >('/meta/query/parameterized', {
        query: SQL_QUERIES.GET_FOREIGN_KEYS,
        params: [data.schema, data.table],
      })

      const foreignKeys = foreignKeysResponse.data.map((fk) => ({
        constraint_name: fk.constraint_name,
        column_name: fk.column_name,
        foreign_table_schema: fk.foreign_table_schema,
        foreign_table_name: fk.foreign_table_name,
        foreign_column_name: fk.foreign_column_name,
      }))

      return {
        data: {
          columns,
          primary_keys: primaryKeys,
          foreign_keys: foreignKeys,
        },
      }
    } catch (error) {
      console.error('Error fetching table metadata:', error)
      handleApiError(error)
    }
  })

export const getTableData = createServerFn({ method: 'POST' })
  .inputValidator((d: TableDataParams) => {
    // Use the provided sortBy, primary key, filter column, or firstColumnName as fallback
    const defaultSortColumn = 
      d.sortBy || 
      d.primaryKeys?.[0] || 
      Object.keys(d.filters || {})[0] ||
      d.firstColumnName

    return {
      ...d,
      page: d.page || 1,
      pageSize: d.pageSize || DEFAULT_PAGE_SIZE,
      sortBy: defaultSortColumn,
      sortDirection: d.sortDirection || 'asc',
      filters: d.filters || {},
    } as TableDataParams
  })
  .handler(async ({ data }) => {
    try {
      // Build the base query
      const schema = data.schema
      const table = data.table
      const offset = (data.page - 1) * data.pageSize
      const limit = data.pageSize
      const sortOrder = data.sortDirection === 'desc' ? 'DESC' : 'ASC'

      // Build WHERE clause from filters
      const filterEntries = Object.entries(data.filters || {})
      const whereClauses = filterEntries
        .map(([key]) => `"${key}" = ?`)
        .join(' AND ')
      const filterValues = filterEntries.map(([_, value]) => value)

      // Build the count query
      const countQuery =
        `SELECT COUNT(*) as total FROM "${schema}"."${table}"` +
        (whereClauses ? ` WHERE ${whereClauses}` : '')

      // Build the data query with proper parameter binding
      let dataQuery = `SELECT * FROM "${schema}"."${table}"`

      // Add WHERE clause if there are filters
      if (whereClauses) {
        dataQuery += ` WHERE ${whereClauses}`
      }

      // Add ORDER BY only if we have a sort column
      if (data.sortBy) {
        dataQuery += ` ORDER BY "${data.sortBy}" ${sortOrder}`
      }

      // Add pagination with direct values (not parameterized)
      dataQuery += ` LIMIT ${limit} OFFSET ${offset}`

      // First, get the total count
      const countResult = await apiClient.post<Array<{ total: number }>>(
        '/meta/query/parameterized',
        {
          query: countQuery,
          params: [...filterValues],
        },
      )

      const total = countResult.data?.[0]?.total || 0

      // Then get the paginated data
      const result = await apiClient.post<Array<Record<string, any>>>(
        '/meta/query/parameterized',
        {
          query: dataQuery,
          params: [...filterValues],
        },
      )

      // Ensure we're returning the data in the expected format
      return {
        data: Array.isArray(result.data) ? result.data : [],
        total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: Math.ceil(total / data.pageSize),
      }
    } catch (error) {
      console.error('Error in getTableData:', error)
      handleApiError(error)
    }
  })
