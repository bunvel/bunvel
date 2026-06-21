import { apiClient, handleApiError } from '@/lib/api-client'
import { logWideEvent } from '@/lib/logger'
import type { Project } from '@/types/project'
import { createServerFn } from '@tanstack/react-start'

export const getProject = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await apiClient.get<Project>('/meta/project')

      if (!response.data) {
        throw new Error('Invalid response format: expected project data')
      }

      return response.data
    } catch (error) {
      logWideEvent('project.fetch.error', { error })
      handleApiError(error)
    }
  },
)

export const getDatabaseStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const query = `
        SELECT
          (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'public') as tables_count,
          (SELECT coalesce(sum(n_live_tup)::int, 0) FROM pg_stat_user_tables) as rows_count,
          (SELECT pg_database_size(current_database())) as db_size_bytes,
          (SELECT count(*)::int FROM pg_indexes WHERE schemaname = 'public') as indexes_count
      `
      const response = await apiClient.post<Array<Record<string, any>>>(
        '/meta/query',
        { query },
      )
      const data = response.data?.[0]
      return {
        tablesCount: Number(data?.tables_count ?? 0),
        rowsCount: Number(data?.rows_count ?? 0),
        dbSizeBytes: Number(data?.db_size_bytes ?? 0),
        indexesCount: Number(data?.indexes_count ?? 0),
      }
    } catch (error) {
      logWideEvent('project.stats.error', { error })
      return {
        tablesCount: 0,
        rowsCount: 0,
        dbSizeBytes: 0,
        indexesCount: 0,
      }
    }
  },
)
