import { queryClient } from '@/lib/query-client'
import { truncateTable } from '@/services/table.service'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useTruncateTable() {
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
