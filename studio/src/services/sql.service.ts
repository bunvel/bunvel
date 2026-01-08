import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'

export interface QueryResult {
  data: Record<string, any>[]
  columns: string[]
  rowCount: number
  executionTime: number
}

export const executeQuery = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    if (!data?.trim()) {
      throw new Error('Query cannot be empty')
    }

    try {
      const startTime = performance.now()
      const response = await apiClient.post<Record<string, any>[]>(
        '/meta/query',
        { query: data },
      )
      const result = response.data
      const endTime = performance.now()

      if (!Array.isArray(result)) {
        throw new Error('Invalid response format: expected an array of rows')
      }

      const columns = result.length > 0 ? Object.keys(result[0]) : []

      return {
        data: result,
        columns,
        rowCount: result.length,
        executionTime: endTime - startTime,
      }
    } catch (error) {
      console.error('Query execution error:', error)
      handleApiError(error)
    }
  })
