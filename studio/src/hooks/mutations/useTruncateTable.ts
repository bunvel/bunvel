import { reactQueryKeys } from '@/hooks/queries/react-query-keys'
import { truncateTable } from '@/services/table.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useTruncateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { schema: string; table: string }) =>
      truncateTable({ data: params }),
    onSuccess: (_, { schema, table }) => {
      // Invalidate the specific query with the exact parameters
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.data({
          schema,
          table,
          page: 1,
          pageSize: 50,
        }),
      })

      toast.success('Table truncated successfully')
    },
  })
}
