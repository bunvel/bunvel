import {
  ColumnMetadata,
  CreateRowParams,
  DeleteRowsParams,
  SchemaTable,
  TableDataParams,
} from '@/types'
import { UpdateRowParams } from '@/types/database'
import { DEFAULT_PAGE_SIZE, FilterSqlOperators } from '@/utils/constant'
import { QUERY_OPERATION_KEYS } from '@/utils/query-keys'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'

export const getTableMetadata = createServerFn({ method: 'POST' })
  .inputValidator((d: SchemaTable) => {
    if (!d.table) {
      throw new Error('table is required for getTableMetadata')
    }
    return d as Required<SchemaTable>
  })
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
      >('/meta/query?key=' + QUERY_OPERATION_KEYS.GET_TABLE_METADATA, {
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
          // Skip filters with empty values (except IS NULL and IS NOT NULL)
          if (
            filter.operator !== 'IS NULL' &&
            filter.operator !== 'IS NOT NULL' &&
            (filter.value === null ||
              filter.value === '' ||
              filter.value === undefined)
          ) {
            return // Skip this filter
          }

          const columnRef = `"${filter.column}"`
          const sqlOperator = FilterSqlOperators[filter.operator]

          if (sqlOperator) {
            let whereClause: string

            if (sqlOperator.requiresParameter) {
              const paramIndex = params.length + 1
              whereClause = `${columnRef} ${sqlOperator.template.replace('%d', paramIndex.toString())}`

              const value = sqlOperator.valueFormatter
                ? sqlOperator.valueFormatter(filter.value)
                : filter.value
              params.push(value)
            } else {
              // For IS NULL and IS NOT NULL, no parameter needed
              whereClause = `${columnRef} ${sqlOperator.template}`
            }

            whereClauses.push(whereClause)
          }
        })
      }

      const whereClause = whereClauses.length
        ? `WHERE ${whereClauses.join(' AND ')}`
        : ''

      // Get total count with filters
      const countQuery = `SELECT COUNT(*) as total FROM ${tableRef} ${whereClause}`
      const countResult = await apiClient.post<Array<{ total: number }>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_TABLE_DATA,
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
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_TABLE_DATA,
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

export const deleteRows = createServerFn({ method: 'POST' })
  .inputValidator((data: DeleteRowsParams) => {
    if (!data?.schema || !data?.table) {
      throw new Error('Schema and table names are required')
    }
    if (!data?.primaryKeys?.length) {
      throw new Error('At least one primary key is required')
    }
    if (!data?.rows?.length) {
      throw new Error('At least one row to delete is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const { schema, table, primaryKeys, rows } = data
      const tableRef = `"${schema}"."${table}"`

      // Build WHERE clause for each row based on primary keys
      const whereClauses: string[] = []
      const params: any[] = []

      rows.forEach((row) => {
        const rowConditions: string[] = []

        primaryKeys.forEach((pk) => {
          const paramIndex = params.length + 1
          rowConditions.push(`"${pk}" = $${paramIndex}`)
          params.push(row[pk])
        })

        if (rowConditions.length > 0) {
          whereClauses.push(`(${rowConditions.join(' AND ')})`)
        }
      })

      if (whereClauses.length === 0) {
        throw new Error('No valid conditions for deletion')
      }

      const whereClause = `WHERE ${whereClauses.join(' OR ')}`
      const query = `DELETE FROM ${tableRef} ${whereClause}`

      await apiClient.post(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.DELETE_ROWS,
        { query, params },
      )

      return {
        success: true,
        deletedCount: rows.length,
      }
    } catch (error) {
      console.error('Error in deleteRows:', error)
      handleApiError(error)
    }
  })

export const insertRow = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateRowParams) => {
    if (!data?.schema || !data?.table) {
      throw new Error('Schema and table names are required')
    }
    if (!data?.row) {
      throw new Error('Row data is required')
    }
    return data
  })
  .handler(async ({ data }: { data: CreateRowParams }) => {
    try {
      const { schema, table, row } = data
      const tableRef = `"${schema}"."${table}"`

      // Process fields for PostgreSQL
      const processedRow: Record<string, any> = {}
      for (const [key, value] of Object.entries(row)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Stringify objects (JSON/JSONB columns)
          processedRow[key] = JSON.stringify(value)
        } else if (Array.isArray(value)) {
          // Convert arrays to PostgreSQL array format
          processedRow[key] = `{${value.map((v) => `"${v}"`).join(',')}}`
        } else {
          processedRow[key] = value
        }
      }

      // Build INSERT query
      const columns = Object.keys(processedRow)
      const values = Object.values(processedRow)

      if (columns.length === 0) {
        throw new Error('At least one column value is required')
      }

      const columnNames = columns.map((col) => `"${col}"`).join(', ')
      const paramPlaceholders = values
        .map((_, index) => `$${index + 1}`)
        .join(', ')

      const query = `INSERT INTO ${tableRef} (${columnNames}) VALUES (${paramPlaceholders}) RETURNING *`

      const result = await apiClient.post<Array<Record<string, any>>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.CREATE_ROW,
        { query, params: values },
      )

      return {
        success: true,
        data: result.data?.[0] || null,
      }
    } catch (error) {
      console.error('Error in insertRow:', error)
      handleApiError(error)
    }
  })

export const updateRow = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateRowParams) => {
    if (!data?.schema || !data?.table) {
      throw new Error('Schema and table names are required')
    }
    if (!data?.row) {
      throw new Error('Row data is required')
    }
    if (!data?.primaryKeys?.length) {
      throw new Error('Primary keys are required for update')
    }
    return data
  })
  .handler(async ({ data }: { data: UpdateRowParams }) => {
    try {
      const { schema, table, row, primaryKeys } = data

      // Process fields for PostgreSQL
      const processedRow: Record<string, any> = {}
      for (const [key, value] of Object.entries(row)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Stringify objects (JSON/JSONB columns)
          processedRow[key] = JSON.stringify(value)
        } else if (Array.isArray(value)) {
          // Convert arrays to PostgreSQL array format
          processedRow[key] = `{${value.map((v) => `"${v}"`).join(',')}}`
        } else {
          processedRow[key] = value
        }
      }

      const tableRef = `"${schema}"."${table}"`

      // Build SET clause
      const setColumns = Object.keys(processedRow).filter(
        (key) => !primaryKeys.includes(key),
      )
      const setValues = setColumns.map((key) => processedRow[key])

      if (setColumns.length === 0) {
        throw new Error('At least one non-primary key column must be updated')
      }

      const setClause = setColumns
        .map((col, index) => `"${col}" = $${index + 1}`)
        .join(', ')

      // Build WHERE clause for primary keys
      const whereConditions = primaryKeys.map((pk: string, index: number) => {
        const paramIndex = setValues.length + index + 1
        return `"${pk}" = $${paramIndex}`
      })

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`

      // Combine all parameters
      const allParams = [
        ...setValues,
        ...primaryKeys.map((pk: string) => processedRow[pk]),
      ]

      const query = `UPDATE ${tableRef} SET ${setClause} ${whereClause} RETURNING *`

      const result = await apiClient.post<Array<Record<string, any>>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.UPDATE_ROW,
        { query, params: allParams },
      )

      return {
        success: true,
        data: result.data?.[0] || null,
      }
    } catch (error) {
      console.error('Error in updateRow:', error)
      handleApiError(error)
    }
  })
