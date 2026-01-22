import { insertRow } from '@/services/editor.service'
import type { CreateRowParams } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reactQueryKeys } from '../queries/react-query-keys'

export function useCreateRow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateRowParams) => insertRow({ data: params }),
    onSuccess: (_, { schema, table }) => {
      // Invalidate table data query to refresh the data
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.data({
          schema,
          table,
          page: 1, // Will be invalidated for all pages
          pageSize: 50,
        }),
      })
      toast.success('Row created successfully')
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create row'
      toast.error('Error creating row', {
        description: errorMessage,
      })
    },
  })
}
