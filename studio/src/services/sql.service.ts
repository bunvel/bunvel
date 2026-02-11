import { apiClient, handleApiError } from '@/lib/api-client'
import { logWideEvent } from '@/lib/logger'
import { createServerFn } from '@tanstack/react-start'

export const executeQuery = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    if (!data?.trim()) {
      throw new Error('Query cannot be empty')
    }

    try {
      const startTime = performance.now()
      const response = await apiClient.post<Array<Record<string, any>>>(
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
      logWideEvent('sql.execute.error', { query: data, error })
      handleApiError(error)
    }
  })
