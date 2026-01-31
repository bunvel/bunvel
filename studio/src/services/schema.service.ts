import type { Schema } from '@/types'
import { escapeIdentifier } from '@/utils/func'
import { QUERY_OPERATION_KEYS } from '@/utils/query-keys'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from '../lib/api-client'
import { SQL_QUERIES } from '../lib/sql-queries'

export const getSchemas = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const response = await apiClient.post<Array<Schema>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_SCHEMAS,
        {
          query: SQL_QUERIES.GET_ALL_SCHEMAS,
        },
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

      const query = `CREATE SCHEMA IF NOT EXISTS ${escapeIdentifier(data)}`

      const response = await apiClient.post(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.CREATE_SCHEMA,
        {
          query,
        },
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Failed to create schema:', error)
      handleApiError(error)
    }
  })
