import { queryClient } from '@/lib/query-client'
import { deleteRows } from '@/services/editor.service'
import { createTable } from '@/services/table.service'
import type { CreateTableParams } from '@/types/database'
import type { DeleteRowsParams } from '@/types/table'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateTable() {
  return useMutation({
    mutationFn: (params: CreateTableParams) => createTable({ data: params }),
    onSuccess: (_, { schema }) => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.list(schema),
      })
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.databaseTables.list(schema),
      })
      toast.success('Table created successfully')
    },
  })
}

export function useDeleteRows() {
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
  })
}
