import { queryClient } from '@/lib/query-client'
import { createIndex } from '@/services/index.service'
import type { CreateIndexParams } from '@/types/database'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateIndex() {
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
