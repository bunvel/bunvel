import { getTableData, getTableMetadata } from '@/services/editor.service';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-key';

export function useTableMetadata(schema?: string, table?: string) {
  return useQuery({
    queryKey: schema && table ? queryKeys.tables.metadata(schema, table) : ['tableMetadata', schema, table],
    queryFn: async () => {
      if (!schema || !table) return Promise.reject(new Error('Schema and table are required'));
      const result = await getTableMetadata({ data: { schema, table } });
      return result?.data;
    },
    enabled: !!schema && !!table,
  });
}

export function useTableData(
  schema?: string,
  table?: string,
  options: {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
    primaryKeys?: string[];
  } = { page: 1, pageSize: 50 }
) {
  const { data: metadata } = useTableMetadata(schema, table);
  
  return useQuery({
    queryKey: schema && table ? 
      queryKeys.tables.data({
        schema,
        table,
        page: options.page,
        pageSize: options.pageSize,
        sortBy: options.sortBy,
        sortDirection: options.sortDirection,
        filters: options.filters,
      }) : 
      ['tableData', schema, table, options],
    queryFn: async () => {
      if (!schema || !table) {
        throw new Error('Schema and table are required');
      }

      // Convert filters to the format expected by the API
      const filterObject = options.filters || {};
      
      return getTableData({
        data: {
          schema,
          table,
          page: options.page,
          pageSize: options.pageSize,
          sortBy: options.sortBy,
          sortDirection: options.sortDirection,
          filters: filterObject,
          primaryKeys: options.primaryKeys || metadata?.primary_keys || [],
        },
      });
    },
    enabled: !!schema && !!table && !!metadata,
    placeholderData: (previousData) => previousData,
  });
}
