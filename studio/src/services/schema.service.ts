import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'
export interface SchemaResult {
  data: Record<string, any>[]
}

export interface SchemaError {
  message: string
  code?: string
  details?: any
}

export interface Schema {
  schema_name: string
}

export interface Table {
  table_name: string
  table_schema: string
  table_type: 'BASE TABLE' | 'VIEW' | string
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

      // Properly quote the schema name to handle special characters
      const schemaName = `"${data.replace(/"/g, '""')}"`
      const query = `CREATE SCHEMA IF NOT EXISTS ${schemaName}`

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
  .inputValidator((d: string) => {
    if (!d || typeof d !== 'string') {
      throw new Error('Schema name is required')
    }
    return d
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Table[]>(
        '/meta/parameterized-query',
        {
          query: SQL_QUERIES.GET_TABLES,
          params: [data],
        },
      )
      return response.data
    } catch (error) {
      console.error('Error fetching tables:', error)
      handleApiError(error)
    }
  })
