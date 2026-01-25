import { getDatabaseEnums } from '@/services/enum.service'
import type { DatabaseEnum } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from './react-query-keys'

export function useDatabaseEnums(schema: string) {
  return useQuery<DatabaseEnum[]>({
    queryKey: reactQueryKeys.enums.list(schema),
    queryFn: () => getDatabaseEnums({ data: { schema } }),
    enabled: !!schema,
    staleTime: 20 * 60 * 1000, // 20 minutes for enums (rarely change)
    gcTime: 40 * 60 * 1000, // 40 minutes garbage collection
  })
}
