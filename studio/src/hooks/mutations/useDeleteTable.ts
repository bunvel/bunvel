import { deleteTable } from '@/services/table.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reactQueryKeys } from '../queries/react-query-keys'

interface UseDeleteTableOptions {
  onTableDeleted?: (schema: string, table: string) => void
}

export function useDeleteTable(options: UseDeleteTableOptions = {}) {
  const { onTableDeleted } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { schema: string; table: string; cascade: boolean }) =>
      deleteTable({ data: params }),
    onSuccess: (_, { schema, table }) => {
      // Invalidate and refetch tables query
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.list(schema),
      })

      // Call custom callback for tab cleanup
      if (onTableDeleted) {
        onTableDeleted(schema, table)
      }

      toast.success('Table deleted successfully')
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error('Failed to delete table', {
        description: errorMessage,
      })
    },
  })
}
