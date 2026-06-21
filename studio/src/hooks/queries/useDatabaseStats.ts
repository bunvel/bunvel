import { useQuery } from '@tanstack/react-query'
import { getDatabaseStats } from '@/services/project.service'

export function useDatabaseStats() {
  return useQuery({
    queryKey: ['database-stats'],
    queryFn: () => getDatabaseStats(),
    staleTime: 30 * 1000, // 30 seconds stale time
    refetchInterval: 60 * 1000, // poll stats every minute
  })
}
