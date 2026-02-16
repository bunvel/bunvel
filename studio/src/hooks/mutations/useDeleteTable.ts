import { queryClient } from '@/lib/query-client'
import { deleteTable } from '@/services/table.service'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTableManager } from '../use-table-manager'

export function useDeleteTable() {
  const { removeTableBySchema } = useTableManager()

  return useMutation({
    mutationFn: (params: { schema: string; table: string; cascade: boolean }) =>
      deleteTable({ data: params }),
    onSuccess: (_, { schema, table }) => {
      // Invalidate and refetch tables query
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.list(schema),
      })

      removeTableBySchema(schema, table)

      toast.success('Table deleted successfully')
    },
  })
}
