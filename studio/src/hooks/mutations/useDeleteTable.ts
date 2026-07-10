"use client"

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
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.list(schema),
      })

      removeTableBySchema(schema, table)

      toast.success('Table deleted successfully')
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
