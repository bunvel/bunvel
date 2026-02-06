import { apiClient, handleApiError } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { SQL_QUERIES } from '@/lib/sql-queries'
import type { CreateIndexParams, DatabaseTableIndexes } from '@/types/database'
import { escapeIdentifier } from '@/utils/func'
import { QUERY_OPERATION_KEYS } from '@/utils/query-keys'
import { createServerFn } from '@tanstack/react-start'

export const getDatabaseTableIndexes = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Array<DatabaseTableIndexes>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_DATABASE_INDEXES,
        {
          query: SQL_QUERIES.GET_TABLE_INDEXES,
          params: [data.schema],
        },
      )
      return response.data as Array<DatabaseTableIndexes>
    } catch (error) {
      logger
        .service('index.service')
        .error('Error fetching table indexes', error)
      handleApiError(error)
    }
  })

export const createIndex = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateIndexParams) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    if (!data?.table) {
      throw new Error('Table name is required')
    }
    if (!data?.columns || data.columns.length === 0) {
      throw new Error('At least one column is required')
    }
    if (data.columns.length > 32) {
      throw new Error('Maximum 32 columns allowed per index')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const {
        schema,
        table,
        columns,
        unique = false,
        indexType = 'btree',
      } = data

      // Build the CREATE INDEX SQL with auto-generated index name
      const uniqueClause = unique ? 'UNIQUE ' : ''
      const usingClause = ` USING ${indexType}`
      const columnsList = columns.map((col) => escapeIdentifier(col)).join(', ')
      const fullTableName =
        escapeIdentifier(schema) + '.' + escapeIdentifier(table)

      // Auto-generate index name: table_name_columns_idx
      const columnsSuffix = columns.slice(0, 3).join('_') // Limit to first 3 columns to keep name reasonable
      const autoIndexName = `${table}_${columnsSuffix}_idx`
      const fullIndexName = escapeIdentifier(autoIndexName)

      const query = `CREATE ${uniqueClause}INDEX ${fullIndexName} ON ${fullTableName} ${usingClause} (${columnsList})`

      await apiClient.post(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.CREATE_INDEX,
        { query },
      )
      return { success: true }
    } catch (error) {
      logger.service('index.service').error('Error creating index', error)
      handleApiError(error)
    }
  })
