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
