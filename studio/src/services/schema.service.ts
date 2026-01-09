import { escapeIdentifier } from '@/utils/func'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'

export interface Schema {
  schema_name: string
}

export const getSchemas = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const response = await apiClient.post<Array<Schema>>('/meta/query', {
        query: SQL_QUERIES.GET_SCHEMAS,
      })

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

      const query = `CREATE SCHEMA IF NOT EXISTS "${escapeIdentifier(data)}"`

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
