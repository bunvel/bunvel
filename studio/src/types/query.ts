import { queryKeys } from '@/hooks/queries/query-key'
import { SQL_QUERIES } from '@/services/sql-queries'

export type QueryKeys = typeof queryKeys
export type SqlQueryKey = keyof typeof SQL_QUERIES
