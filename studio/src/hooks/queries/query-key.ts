import type { QueryKeys } from '@/types'
import { FilterConfig } from '@/types/table'

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
    metadata: (schema: string, table: string) =>
      ['tableMetadata', schema, table] as const,
    data: (params: {
      schema: string
      table: string
      page: number
      pageSize: number
      sorts?: Array<{ column: string; direction: 'asc' | 'desc' }>
      filters?: FilterConfig[]
    }) => ['tableData', params] as const,
    detail: (schema: string, table: string) =>
      [...queryKeys.tables.list(schema), table] as const,
    columns: (oid: string) => ['tables', oid] as const,
  },
  indexes: {
    list: (schema: string) => ['indexes', schema] as const,
  },
  enums: {
    list: (schema: string) => ['enums', schema] as const,
  },
  functions: {
    list: (schema: string) => ['functions', schema] as const,
  },
  triggers: {
    list: (schema: string) => ['triggers', schema] as const,
  },
} as const

export type { QueryKeys }
