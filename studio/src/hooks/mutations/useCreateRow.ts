import { reactQueryKeys } from '@/hooks/queries/react-query-keys'
import { insertRow } from '@/services/editor.service'
import type { CreateRowParams } from '@/types/database'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
  })
}
