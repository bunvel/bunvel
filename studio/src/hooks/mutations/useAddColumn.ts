import { reactQueryKeys } from '@/hooks/queries/react-query-keys'
import { addColumn } from '@/services/editor.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface AddColumnParams {
  schema: string
  table: string
  column: string
  dataType: string
  defaultValue?: string
  foreignKeys?: Array<{
    column: string
    referencedTable: string
    referencedColumn: string
    onDelete?: string
  }>
}

export function useAddColumn(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      schema,
      table,
      column,
      dataType,
      defaultValue,
      foreignKeys,
    }: AddColumnParams) =>
      addColumn({
        data: { schema, table, column, dataType, defaultValue, foreignKeys },
      }),
    onSuccess: (_, variables) => {
      // Invalidate table metadata to refresh the column list
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.metadata(
          variables.schema,
          variables.table,
        ),
      })

      // Invalidate table data to refresh the table view (all pages, sizes, filters, sorts)
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.tables.data({
          schema: variables.schema,
          table: variables.table,
        }),
      })

      toast.success('Column added successfully')

      // Call custom onSuccess callback if provided
      if (options?.onSuccess) {
        options.onSuccess()
      }
    },
  })
}
