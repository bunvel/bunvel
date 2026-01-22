import { getTableData } from '@/services/editor.service'
import { ColumnMetadata, FilterConfig, TableDataResult } from '@/types/table'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from './react-query-keys'

const MAX_ROWS = 10

interface UseRelatedTableDataOptions {
  foreignKeyColumn: ColumnMetadata
  foreignKeyValue: string | number | null
  enabled?: boolean
}

export function useRelatedTableData({
  foreignKeyColumn,
  foreignKeyValue,
  enabled = true,
}: UseRelatedTableDataOptions) {
  // Only fetch if we have a valid foreign key relationship and a non-null value
  const shouldFetch = Boolean(
    enabled &&
    foreignKeyColumn.is_foreign_key &&
    foreignKeyColumn.foreign_table_schema &&
    foreignKeyColumn.foreign_table_name &&
    foreignKeyColumn.foreign_column_name &&
    foreignKeyValue !== null &&
    foreignKeyValue !== undefined &&
    foreignKeyValue !== '',
  )

  // Create filter to find the related record
  const filters: FilterConfig[] = shouldFetch
    ? [
        {
          column: foreignKeyColumn.foreign_column_name!,
          operator: '=',
          value: foreignKeyValue,
        },
      ]
    : []

  const {
    data: relatedData,
    isLoading,
    error,
  } = useQuery<TableDataResult>({
    queryKey: shouldFetch
      ? reactQueryKeys.tables.data({
          schema: foreignKeyColumn.foreign_table_schema!,
          table: foreignKeyColumn.foreign_table_name!,
          page: 1,
          pageSize: MAX_ROWS,
          filters,
        })
      : ['relatedTableData', 'disabled'],
    queryFn: async () => {
      if (!shouldFetch) {
        throw new Error('Query is disabled')
      }
      return getTableData({
        data: {
          schema: foreignKeyColumn.foreign_table_schema!,
          table: foreignKeyColumn.foreign_table_name!,
          page: 1,
          pageSize: MAX_ROWS,
          filters,
          primaryKeys: [],
        },
      })
    },
    enabled: shouldFetch,
    placeholderData: (previousData: TableDataResult | undefined) =>
      previousData,
    staleTime: 1 * 60 * 1000, // 1 minute for related table data
    gcTime: 3 * 60 * 1000, // 3 minutes garbage collection
  })

  return {
    data: relatedData,
    isLoading: shouldFetch ? isLoading : false,
    error: shouldFetch ? error : null,
    isEnabled: shouldFetch,
  }
}
