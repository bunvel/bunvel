import {
    getDatabaseEnums,
    getDatabaseFunctions,
    getDatabaseTableColumns,
    getDatabaseTableIndexes,
    getDatabaseTables,
    getDatabaseTriggers,
    getTables,
} from '@/services/table.service'
import type {
    DatabaseTableColumns,
    DatabaseTableIndexes,
    DatabaseTables,
    Table
} from '@/types'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './query-key'

export function useTables(schema: string = "public") {
  return useQuery<Table[]>({
    queryKey: schema ? queryKeys.tables.list(schema) : ['tables', null],
    queryFn: async () => getTables({ data: { schema } }),
    enabled: !!schema,
  })
}

export function useDatabaseTables(schema: string) {
  return useQuery<DatabaseTables[]>({
    queryKey: queryKeys.tables.list(schema),
    queryFn: async () => getDatabaseTables({ data: { schema } }),
    enabled: !!schema,
  })
}

export function useDatabaseTableColumns(oid: string) {
  return useQuery<DatabaseTableColumns[]>({
    queryKey: queryKeys.tables.columns(oid),
    queryFn: async () => getDatabaseTableColumns({ data: { oid } }),
    enabled: !!oid,
  })
}

export function useDatabaseIndexes(schema: string) {
  return useQuery<DatabaseTableIndexes[]>({
    queryKey: schema ? queryKeys.tables.list(schema) : ['tables', null],
    queryFn: async () => getDatabaseTableIndexes({ data: { schema } }),
    enabled: !!schema,
  })
}

export const useDatabaseEnums = (schema: string) => {
  return useQuery({
    queryKey: ['enums', schema],
    queryFn: () => getDatabaseEnums({ data: { schema } }),
    enabled: !!schema,
  })
}

export const useDatabaseFunctions = (schema: string) => {
  return useQuery({
    queryKey: ['functions', schema],
    queryFn: () => getDatabaseFunctions({ data: { schema } }),
    enabled: !!schema,
  })
}

export const useDatabaseTriggers = (schema: string) => {
  return useQuery({
    queryKey: ['triggers', schema],
    queryFn: () => getDatabaseTriggers({ data: { schema } }),
    enabled: !!schema,
  })
}
