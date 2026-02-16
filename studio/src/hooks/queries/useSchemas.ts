import { getSchemas } from '@/services/schema.service'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from '../../utils/react-query-keys'

export function useSchemas() {
  return useQuery({
    queryKey: reactQueryKeys.schemas.list(),
    queryFn: getSchemas,
    staleTime: 30 * 60 * 1000, // 30 minutes for schemas (rarely change)
    gcTime: 60 * 60 * 1000, // 60 minutes garbage collection
  })
}
