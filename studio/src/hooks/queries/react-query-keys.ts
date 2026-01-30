import { FilterConfig } from '@/types/table'

export const reactQueryKeys = {
  sql: {
    query: (query: string) => ['sqlQuery', query] as const,
  },
  schemas: {
    list: () => ['schemas', 'list'] as const,
  },
  schemaDiagram: {
    detail: (schema: string) => ['schemaDiagram', 'detail', schema] as const,
  },
  tables: {
    list: (schema: string) => ['tables', 'list', schema] as const,
    metadata: (schema: string, table: string) =>
      ['tables', 'metadata', schema, table] as const,
    data: (params: {
      schema: string
      table: string
      page: number
      pageSize: number
      sorts?: Array<{ column: string; direction: 'asc' | 'desc' }>
      filters?: FilterConfig[]
    }) => ['tables', 'data', params] as const,
    detail: (schema: string, table: string) =>
      ['tables', 'detail', schema, table] as const,
    columns: (oid: string) => ['tables', 'columns', oid] as const,
  },
  databaseTables: {
    list: (schema: string) => ['databaseTables', 'list', schema] as const,
  },
  indexes: {
    list: (schema: string) => ['indexes', 'list', schema] as const,
  },
  enums: {
    list: (schema: string) => ['enums', 'list', schema] as const,
  },
  functions: {
    list: (schema: string) => ['functions', 'list', schema] as const,
  },
  triggers: {
    list: (schema: string) => ['triggers', 'list', schema] as const,
  },
  project: {
    detail: () => ['project', 'detail'] as const,
  },
} as const

export type ReactQueryKeys = typeof reactQueryKeys
