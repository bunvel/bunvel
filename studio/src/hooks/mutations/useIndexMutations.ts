import { createIndex } from '@/services/index.service'
import type { CreateIndexParams } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reactQueryKeys } from '@/hooks/queries/react-query-keys'

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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create index'
      toast.error('Error creating index', {
        description: errorMessage,
      })
    },
  })
}
