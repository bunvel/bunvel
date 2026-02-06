import { getTableData, getTableMetadata } from '@/services/editor.service'
import type { FilterConfig } from '@/types/table'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from './react-query-keys'

export function useTableMetadata(schema?: string, table?: string) {
  return useQuery({
    queryKey:
      schema && table
        ? reactQueryKeys.tables.metadata(schema, table)
        : ['tableMetadata', schema, table],
    queryFn: async () => {
      if (!schema || !table)
        return Promise.reject(new Error('Schema and table are required'))
      const result = await getTableMetadata({ data: { schema, table } })
      return result?.data
    },
    enabled: !!schema && !!table,
    staleTime: 10 * 60 * 1000, // 10 minutes for metadata
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  })
}

export function useTableData(
  schema?: string,
  table?: string,
  options: {
    page: number
    pageSize: number
    sorts?: Array<{ column: string; direction: 'asc' | 'desc' }>
    filters?: Array<FilterConfig>
    primaryKeys?: Array<string>
  } = {
    page: 1,
    pageSize: 50,
    filters: [],
  },
) {
  const { data: metadata } = useTableMetadata(schema, table)

  return useQuery({
    queryKey:
      schema && table
        ? reactQueryKeys.tables.data({
            schema,
            table,
            page: options.page,
            pageSize: options.pageSize,
            sorts: options.sorts,
            filters: options.filters, // Include filters in queryKey
          })
        : ['tableData', schema, table, options],
    queryFn: async () => {
      if (!schema || !table) {
        throw new Error('Schema and table are required')
      }

      return getTableData({
        data: {
          schema,
          table,
          page: options.page,
          pageSize: options.pageSize,
          sorts: options.sorts,
          filters: options.filters,
          primaryKeys: options.primaryKeys || metadata?.primary_keys || [],
        },
      })
    },
    enabled: !!schema && !!table && !!metadata,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000, // 2 minutes for table data
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  })
}
