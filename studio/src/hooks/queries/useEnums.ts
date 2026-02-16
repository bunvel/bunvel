import { getDatabaseEnums } from '@/services/enum.service'
import type { DatabaseEnum } from '@/types/database'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from '../../utils/react-query-keys'

export function useDatabaseEnums(schema: string) {
  return useQuery<Array<DatabaseEnum>>({
    queryKey: reactQueryKeys.enums.list(schema),
    queryFn: () => getDatabaseEnums({ data: { schema } }),
    enabled: !!schema,
    staleTime: 20 * 60 * 1000, // 20 minutes for enums (rarely change)
    gcTime: 40 * 60 * 1000, // 40 minutes garbage collection
  })
}
