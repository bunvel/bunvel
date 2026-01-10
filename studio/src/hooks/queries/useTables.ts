import {
  DatabaseTableColumns,
  DatabaseTableIndexes,
  DatabaseTables,
  getDatabaseTableColumns,
  getDatabaseTableIndexes,
  getDatabaseTables,
  getTables,
  Table,
} from '@/services/table.service'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './query-key'

export function useTables(schema?: string) {
  return useQuery<Table[]>({
    queryKey: schema ? queryKeys.tables.list(schema) : ['tables', null],
    queryFn: async () => {
      if (!schema) return []
      const result = await getTables({ data: { schema } })
      return result || []
    },
    enabled: !!schema,
  })
}

export function useDatabaseTables(schema?: string) {
  return useQuery<DatabaseTables[]>({
    queryKey: schema ? queryKeys.tables.list(schema) : ['tables', null],
    queryFn: async () => {
      if (!schema) return []
      const result = await getDatabaseTables({ data: { schema } })
      return result || []
    },
    enabled: !!schema,
  })
}

export function useDatabaseTableColumns(oid: string) {
  return useQuery<DatabaseTableColumns[]>({
    queryKey: queryKeys.tables.columns(oid),
    queryFn: async () => {
      if (!oid) return []
      const result = await getDatabaseTableColumns({ data: { oid } })
      return result || []
    },
    enabled: !!oid,
  })
}

export function useDatabaseIndexes(schema?: string) {
  return useQuery<DatabaseTableIndexes[]>({
    queryKey: schema ? queryKeys.tables.list(schema) : ['tables', null],
    queryFn: async () => {
      if (!schema) return []
      const result = await getDatabaseTableIndexes({ data: { schema } })
      return result || []
    },
    enabled: !!schema,
  })
}
