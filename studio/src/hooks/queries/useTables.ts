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
  Table,
} from '@/types'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from './react-query-keys'

export function useTables(schema: string = 'public') {
  return useQuery<Table[]>({
    queryKey: schema ? reactQueryKeys.tables.list(schema) : ['tables', null],
    queryFn: async () => getTables({ data: { schema } }),
    enabled: !!schema,
    staleTime: 15 * 60 * 1000, // 15 minutes for table list
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  })
}

export function useDatabaseTables(schema: string) {
  return useQuery<DatabaseTables[]>({
    queryKey: reactQueryKeys.databaseTables.list(schema),
    queryFn: async () => getDatabaseTables({ data: { schema } }),
    enabled: !!schema,
    staleTime: 15 * 60 * 1000, // 15 minutes for database tables
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  })
}

export function useDatabaseTableColumns(oid: string) {
  return useQuery<DatabaseTableColumns[]>({
    queryKey: reactQueryKeys.tables.columns(oid),
    queryFn: async () => getDatabaseTableColumns({ data: { oid } }),
    enabled: !!oid,
    staleTime: 10 * 60 * 1000, // 10 minutes for table columns
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  })
}

export function useDatabaseIndexes(schema: string) {
  return useQuery<DatabaseTableIndexes[]>({
    queryKey: reactQueryKeys.indexes.list(schema),
    queryFn: async () => getDatabaseTableIndexes({ data: { schema } }),
    enabled: !!schema,
    staleTime: 10 * 60 * 1000, // 10 minutes for indexes
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  })
}

export const useDatabaseEnums = (schema: string) => {
  return useQuery({
    queryKey: reactQueryKeys.enums.list(schema),
    queryFn: () => getDatabaseEnums({ data: { schema } }),
    enabled: !!schema,
    staleTime: 20 * 60 * 1000, // 20 minutes for enums (rarely change)
    gcTime: 40 * 60 * 1000, // 40 minutes garbage collection
  })
}

export const useDatabaseFunctions = (schema: string) => {
  return useQuery({
    queryKey: reactQueryKeys.functions.list(schema),
    queryFn: () => getDatabaseFunctions({ data: { schema } }),
    enabled: !!schema,
    staleTime: 15 * 60 * 1000, // 15 minutes for functions
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  })
}

export const useDatabaseTriggers = (schema: string) => {
  return useQuery({
    queryKey: reactQueryKeys.triggers.list(schema),
    queryFn: () => getDatabaseTriggers({ data: { schema } }),
    enabled: !!schema,
    staleTime: 10 * 60 * 1000, // 10 minutes for triggers
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  })
}
