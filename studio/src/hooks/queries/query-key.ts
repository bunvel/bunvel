import { FilterOperator } from "@/utils/constant";

export const queryKeys = {
  sql: {
    query: (query: string) => ['sqlQuery', query] as const,
  },
  schemas: {
    all: () => ['schemas'] as const,
    indexes: (schema: string) => ['schemaIndexes', schema] as const,
  },
  tables: {
    list: (schema: string) => ['tables', schema] as const,
    metadata: (schema: string, table: string) => ['tableMetadata', schema, table] as const,
    data: (params: { 
      schema: string; 
      table: string; 
      page: number; 
      pageSize: number; 
      sorts?: Array<{ column: string; direction: 'asc' | 'desc' }>;
      filters?: Array<{
        column: string;
        operator: FilterOperator;
        value: string;
      }>;
    }) => ['tableData', params] as const,
    detail: (schema: string, table: string) => 
      [...queryKeys.tables.list(schema), table] as const,
    columns: (oid: string) => ['tables', oid] as const,
  },
} as const

export type QueryKeys = typeof queryKeys