import { deleteRows } from '@/services/editor.service'
import { createTable } from '@/services/table.service'
import type { CreateTableParams, DeleteRowsParams } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reactQueryKeys } from '../queries/react-query-keys'

export function useCreateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateTableParams) => createTable({ data: params }),
    onSuccess: (_, { schema }) => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.list(schema),
      })
      toast.success('Table created successfully')
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create table'
      toast.error('Error creating table', {
        description: errorMessage,
      })
    },
  })
}

export function useDeleteRows() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: DeleteRowsParams) => deleteRows({ data: params }),
    onSuccess: (result, { schema, table }) => {
      // Invalidate table data query to refresh the data
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.data({
          schema,
          table,
          page: 1, // Will be invalidated for all pages
          pageSize: 50,
        }),
      })
      toast.success(
        `Successfully deleted ${result?.deletedCount || 0} row${(result?.deletedCount || 0) === 1 ? '' : 's'}`,
      )
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete rows'
      toast.error('Error deleting rows', {
        description: errorMessage,
      })
    },
  })
}
