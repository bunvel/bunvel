import { getDatabaseTableIndexes } from '@/services/index.service'
import {
  getDatabaseFunctions,
  getDatabaseTableColumns,
  getDatabaseTables,
  getDatabaseTriggers,
  getTables,
} from '@/services/table.service'
import type {
  DatabaseTableColumns,
  DatabaseTableIndexes,
  DatabaseTables,
  Table,
} from '@/types/database'
import { useQuery } from '@tanstack/react-query'
import { reactQueryKeys } from '../../utils/react-query-keys'

export function useTables(schema: string = 'public') {
  return useQuery<Array<Table>>({
    queryKey: reactQueryKeys.tables.list(schema),
    queryFn: async () => getTables({ data: { schema } }),
    enabled: !!schema,
    staleTime: 15 * 60 * 1000, // 15 minutes for table list
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  })
}

export function useDatabaseTables(schema: string) {
  return useQuery<Array<DatabaseTables>>({
    queryKey: reactQueryKeys.databaseTables.list(schema),
    queryFn: async () => getDatabaseTables({ data: { schema } }),
    enabled: !!schema,
    staleTime: 15 * 60 * 1000, // 15 minutes for database tables
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  })
}

export function useDatabaseTableColumns(oid: string) {
  return useQuery<Array<DatabaseTableColumns>>({
    queryKey: reactQueryKeys.tables.columns(oid),
    queryFn: async () => getDatabaseTableColumns({ data: { oid } }),
    enabled: !!oid,
    staleTime: 10 * 60 * 1000, // 10 minutes for table columns
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  })
}

export function useDatabaseIndexes(schema: string) {
  return useQuery<Array<DatabaseTableIndexes>>({
    queryKey: reactQueryKeys.indexes.list(schema),
    queryFn: async () => getDatabaseTableIndexes({ data: { schema } }),
    enabled: !!schema,
    staleTime: 10 * 60 * 1000, // 10 minutes for indexes
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
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
