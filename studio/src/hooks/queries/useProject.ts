import { getProject } from '@/services/project.service'
import type { Project } from '@/types/project'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from '../../utils/react-query-keys'

export function useProject() {
  return useQuery<Project>({
    queryKey: reactQueryKeys.project.detail(),
    queryFn: () => getProject(),
    staleTime: 30 * 60 * 1000, // 30 minutes for project data
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    retry: 3,
    refetchOnWindowFocus: false,
  })
}
