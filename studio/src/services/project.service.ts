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
          (SELECT count(*)::int FROM pg_stat_activity WHERE state = 'active') as active_connections,
          (SELECT current_setting('server_version')) as pg_version,
          (SELECT pg_database_size(current_database())) as db_size_bytes,
          (SELECT pg_size_bytes(current_setting('shared_buffers'))) as memory_usage_bytes
      `
      const response = await apiClient.post<Array<Record<string, any>>>(
        '/meta/query',
        { query },
      )
      const data = response.data?.[0]
      return {
        activeConnections: Number(data?.active_connections ?? 0),
        pgVersion: String(data?.pg_version ?? 'Unknown'),
        dbSizeBytes: Number(data?.db_size_bytes ?? 0),
        memoryUsageBytes: Number(data?.memory_usage_bytes ?? 0),
      }
    } catch (error) {
      logWideEvent('project.stats.error', { error })
      return {
        activeConnections: 0,
        pgVersion: 'Unknown',
        dbSizeBytes: 0,
        memoryUsageBytes: 0,
      }
    }
  },
)
