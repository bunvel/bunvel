import { queryClient } from '@/lib/query-client'
import { deleteTable } from '@/services/table.service'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTableManager } from '../use-table-manager'

import type { DeleteTableParams } from '@/types/database'

export function useDeleteTable() {
  const { removeTableBySchema } = useTableManager()

  return useMutation({
    mutationFn: (params: DeleteTableParams) =>
      deleteTable({ data: params }),
    onSuccess: (_, { schema, table, kind }) => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.list(schema),
      })

      removeTableBySchema(schema, table)

      const kindName = kind === 'VIEW' ? 'View' : kind === 'MATERIALIZED VIEW' ? 'Materialized view' : 'Table'
      toast.success(`${kindName} deleted successfully`)
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete table. Please try again.'
      toast.error(message)
    },
  })
}
