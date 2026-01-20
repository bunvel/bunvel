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
  table_type: 'r' | 'v' | 'm'
}

export interface TableDataResult {
  data: Record<string, any>[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
}

import { SchemaTable } from '@/types'
import { FilterOperator } from '@/utils/constant'

export interface FilterConfig {
  column: string
  operator: FilterOperator
  value: string
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

export const getTableMetadata = createServerFn({ method: 'POST' })
  .inputValidator((d: SchemaTable) => d)
  .handler(async ({ data }) => {
    try {
      // Single API call to get all metadata
      const metadataResponse = await apiClient.post<
        Array<{
          column_name: string
          data_type: string
          is_nullable: boolean
          column_default: string | null
          is_identity: boolean
          is_updatable: boolean
          table_type: 'r' | 'v' | 'm'
          is_primary_key: boolean
          is_foreign_key: boolean
          foreign_table_schema?: string
          foreign_table_name?: string
          foreign_column_name?: string
          constraint_name?: string
        }>
      >('/meta/query', {
        query: SQL_QUERIES.GET_TABLE_METADATA,
        params: [data.schema, data.table],
      })

      const columns: ColumnMetadata[] = []
      const primaryKeys = new Set<string>()
      const foreignKeysMap = new Map<
        string,
        {
          constraint_name: string
          column_name: string
          foreign_table_schema: string
          foreign_table_name: string
          foreign_column_name: string
        }
      >()

      // Process all data in a single pass
      metadataResponse.data.forEach((column) => {
        // Add to columns
        columns.push({
          column_name: column.column_name,
          data_type: column.data_type,
          is_nullable: column.is_nullable ? 'YES' : 'NO',
          column_default: column.column_default,
          is_identity: column.is_identity ? 'YES' : 'NO',
          is_updatable: column.is_updatable ? 'YES' : 'NO',
          is_primary_key: column.is_primary_key,
          is_foreign_key: column.is_foreign_key,
          foreign_table_schema: column.foreign_table_schema,
          foreign_table_name: column.foreign_table_name,
          foreign_column_name: column.foreign_column_name,
        })

        // Track primary keys
        if (column.is_primary_key) {
          primaryKeys.add(column.column_name)
        }

        // Track foreign keys
        if (
          column.is_foreign_key &&
          column.foreign_table_schema &&
          column.foreign_table_name &&
          column.foreign_column_name &&
          column.constraint_name
        ) {
          const fkKey = `${column.constraint_name}_${column.column_name}`
          if (!foreignKeysMap.has(fkKey)) {
            foreignKeysMap.set(fkKey, {
              constraint_name: column.constraint_name,
              column_name: column.column_name,
              foreign_table_schema: column.foreign_table_schema,
              foreign_table_name: column.foreign_table_name,
              foreign_column_name: column.foreign_column_name,
            })
          }
        }
      })

      if (!metadataResponse.data[0]) {
        console.warn(
          `No metadata found for ${data.schema}.${data.table}, defaulting to table type 'r'`,
        )
      }
      const tableType = metadataResponse.data[0]?.table_type || 'r'

      return {
        data: {
          columns,
          primary_keys: Array.from(primaryKeys),
          foreign_keys: Array.from(foreignKeysMap.values()),
          table_type: tableType,
        },
      }
    } catch (error) {
      console.error('Error fetching table metadata:', error)
      handleApiError(error)
    }
  })

export const getTableData = createServerFn({ method: 'POST' })
  .inputValidator((d: TableDataParams) => ({
    ...d,
    page: d.page || 1,
    pageSize: d.pageSize || DEFAULT_PAGE_SIZE,
  }))
  .handler(async ({ data }) => {
    try {
      const schema = data.schema
      const table = data.table
      const offset = (data.page - 1) * data.pageSize
      const limit = data.pageSize

      const tableRef = `"${schema}"."${table}"`

      // Build WHERE clause for filtering
      const whereClauses: string[] = []
      const params: any[] = []

      if (data.filters?.length) {
        data.filters.forEach((filter) => {
          const paramIndex = params.length + 1
          const columnRef = `"${filter.column}"`

          switch (filter.operator) {
            case 'eq':
              whereClauses.push(`${columnRef} = $${paramIndex}`)
              params.push(filter.value)
              break
            case 'neq':
              whereClauses.push(`${columnRef} != $${paramIndex}`)
              params.push(filter.value)
              break
            case 'gt':
              whereClauses.push(`${columnRef} > $${paramIndex}`)
              params.push(filter.value)
              break
            case 'gte':
              whereClauses.push(`${columnRef} >= $${paramIndex}`)
              params.push(filter.value)
              break
            case 'lt':
              whereClauses.push(`${columnRef} < $${paramIndex}`)
              params.push(filter.value)
              break
            case 'lte':
              whereClauses.push(`${columnRef} <= $${paramIndex}`)
              params.push(filter.value)
              break
            case 'like':
              whereClauses.push(`${columnRef} LIKE $${paramIndex}`)
              params.push(`%${filter.value}%`)
              break
            case 'ilike':
              whereClauses.push(`${columnRef} ILIKE $${paramIndex}`)
              params.push(`%${filter.value}%`)
              break
            case 'is_null':
              whereClauses.push(`${columnRef} IS NULL`)
              break
            case 'not_null':
              whereClauses.push(`${columnRef} IS NOT NULL`)
              break
          }
        })
      }

      const whereClause = whereClauses.length
        ? `WHERE ${whereClauses.join(' AND ')}`
        : ''

      // Get total count with filters
      const countQuery = `SELECT COUNT(*) as total FROM ${tableRef} ${whereClause}`
      const countResult = await apiClient.post<Array<{ total: number }>>(
        '/meta/query',
        { query: countQuery, params },
      )

      const total = countResult.data?.[0]?.total || 0

      // Build ORDER BY clause for sorting
      const orderByClause = data.sorts?.length
        ? `ORDER BY ${data.sorts
            .map((sort) => `"${sort.column}" ${sort.direction.toUpperCase()}`)
            .join(', ')}`
        : ''

      // Get paginated data with filtering and sorting
      const dataQuery = `SELECT * FROM ${tableRef} ${whereClause} ${orderByClause} LIMIT ${limit} OFFSET ${offset}`

      const result = await apiClient.post<Array<Record<string, any>>>(
        '/meta/query',
        { query: dataQuery, params },
      )

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
