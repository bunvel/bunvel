import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'

interface CreateSchemaParams {
  schemaName: string
  ifNotExists?: boolean
  owner?: string
}

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
  .inputValidator((d: CreateSchemaParams) => d)
  .handler(async ({ data }) => {
    try {
      const { schemaName, ifNotExists = true, owner } = data
      let query = `CREATE SCHEMA ${ifNotExists ? 'IF NOT EXISTS ' : ''}"${schemaName}"`

      if (owner) {
        query += ` AUTHORIZATION "${owner}"`
      }

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
      throw error
    }
  })

export const getTables = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
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
