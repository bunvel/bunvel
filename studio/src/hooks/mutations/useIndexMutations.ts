import { reactQueryKeys } from '@/hooks/queries/react-query-keys'
import { createIndex } from '@/services/index.service'
import type { CreateIndexParams } from '@/types/database'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateIndex() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateIndexParams) => createIndex({ data: params }),
    onSuccess: (_, { schema }) => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.indexes.list(schema),
      })
      toast.success('Index created successfully')
    },
  })
}
