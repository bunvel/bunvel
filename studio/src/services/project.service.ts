import type { Project } from '@/types'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from '../lib/api-client'

export const getProject = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await apiClient.get<Project>('/meta/project')

      if (!response.data) {
        throw new Error('Invalid response format: expected project data')
      }

      return response.data
    } catch (error) {
      console.error('Failed to fetch project:', error)
      handleApiError(error)
    }
  },
)
