import { DEFAULT_PAGE_SIZE } from '@/constants/app'
import { reactQueryKeys } from '@/hooks/queries/react-query-keys'
import { useTableManager } from '@/hooks/use-table-manager'
import { updateRow } from '@/services/editor.service'
import type { UpdateRowParams } from '@/types/database'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useUpdateRow() {
  const queryClient = useQueryClient()
  const { handleSelectionClear, tableState, schema, table } = useTableManager()

  return useMutation({
    mutationFn: (params: UpdateRowParams) => updateRow({ data: params }),
    onMutate: async ({ row, primaryKeys }) => {
      if (!schema || !table) {
        return { previousData: null }
      }

      // Build the exact same query parameters as useTableData
      const queryParams = {
        schema,
        table,
        page: (tableState?.pagination?.pageIndex ?? 0) + 1,
        pageSize: tableState?.pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
        sorts: tableState?.sorts,
        filters:
          tableState?.filters && tableState.filters.length > 0
            ? tableState.filters
            : undefined,
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: reactQueryKeys.tables.data(queryParams),
      })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(
        reactQueryKeys.tables.data(queryParams),
      )

      // Optimistically update the specific row
      queryClient.setQueryData(
        reactQueryKeys.tables.data(queryParams),
        (old: any) => {
          if (!old?.data) {
            return old
          }

          // Find the index of the row to update based on primary keys
          const updatedData = old.data.map((existingRow: any) => {
            const isMatchingRow = primaryKeys.every(
              (pk) => existingRow[pk] === row[pk],
            )

            if (isMatchingRow) {
              // Return the updated row with all new values
              return { ...existingRow, ...row }
            }
            return existingRow
          })

          return {
            ...old,
            data: updatedData,
          }
        },
      )

      return { previousData, queryParams }
    },
    onSuccess: () => {
      handleSelectionClear()
      toast.success('Row updated successfully')
    },
    onSettled: (_, error, _variables, context) => {
      // Always refetch after error to ensure server state is in sync
      if (error && context?.queryParams) {
        queryClient.invalidateQueries({
          queryKey: reactQueryKeys.tables.data(context.queryParams),
        })
      }
    },
  })
}
