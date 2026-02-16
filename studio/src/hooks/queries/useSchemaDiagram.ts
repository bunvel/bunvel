import { getSchemaDiagram } from '@/services/schema-diagram.service'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from '../../utils/react-query-keys'

export function useSchemaDiagram(schema: string) {
  return useQuery({
    queryKey: reactQueryKeys.schemaDiagram.detail(schema),
    queryFn: () => getSchemaDiagram({ data: schema }),
    staleTime: 5 * 60 * 1000, // 5 minutes for schema diagram
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    enabled: !!schema,
  })
}
