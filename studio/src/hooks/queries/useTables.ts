import { getTables, Table } from '@/services/schema.service';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-key';

export function useTables(schema?: string) {
  return useQuery<Table[]>({
    queryKey: schema ? queryKeys.tables.list(schema) : ['tables', null],
    queryFn: async () => {
      if (!schema) return [];
      const result = await getTables({ data: {schema} });
      return result || [];
    },
    enabled: !!schema,
  });
}
