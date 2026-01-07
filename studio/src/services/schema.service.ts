import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'

export interface Table {
  name: string
  kind: 'BASE TABLE' | 'VIEW' | 'MATERIALIZED VIEW' | string
}

export const getSchemas = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const response = await apiClient.post<Array<{ schema_name: string }>>(
        '/meta/query',
        { query: SQL_QUERIES.GET_SCHEMAS },
      )

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected an array of rows')
      }

      return {
        data: response.data,
      }
    } catch (error) {
      console.error('Failed to fetch schemas:', error)
      handleApiError(error)
    }
  },
)

export const createSchema = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    try {
      // Validate identifier format
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data)) {
        throw new Error(
          'Invalid schema name: must start with a letter or underscore and contain only letters, numbers, or underscores',
        )
      }

      const query = `CREATE SCHEMA IF NOT EXISTS ${data.replace(/"/g, '""')}`

      const response = await apiClient.post('/meta/query', {
        query,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Failed to create schema:', error)
      handleApiError(error)
    }
  })

export const getTables = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Table[]>(
        '/meta/query/parameterized',
        {
          query: SQL_QUERIES.GET_TABLES,
          params: [data.schema],
        },
      )
      return response.data as Table[]
    } catch (error) {
      console.error('Error fetching tables:', error)
      handleApiError(error)
    }
  })

export interface DeleteTableParams {
  schema: string
  table: string
  cascade: boolean
}

export const deleteTable = createServerFn({ method: 'POST' })
  .inputValidator((data: DeleteTableParams) => {
    if (!data?.schema || !data?.table) {
      throw new Error('Schema and table names are required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const { schema, table, cascade } = data
      const cascadeClause = cascade ? ' CASCADE' : ''
      const query = `DROP TABLE IF EXISTS \"${schema}\".\"${table}\"${cascadeClause}`
      
      await apiClient.post('/meta/query', { query })
      return { success: true }
    } catch (error) {
      console.error('Error deleting table:', error)
      handleApiError(error)
    }
  })
