import { executeQuery } from '@/services/sql.service'
import { queryClient } from '@/lib/query-client'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'

const isDDLQuery = (query: string) =>
  /^\s*(create|alter|drop|truncate)\s+(table|schema|index|view|database)/im.test(query)

export function useExecuteSqlQuery() {
  return useMutation({
    mutationFn: (query: string) => {
      if (!query?.trim()) {
        throw new Error('Query cannot be empty')
      }
      return executeQuery({ data: query })
    },
    onSuccess: (_, query) => {
      if (query && isDDLQuery(query)) {
        queryClient.invalidateQueries({
          queryKey: reactQueryKeys.tables.list('public'),
        })
        queryClient.invalidateQueries({
          queryKey: reactQueryKeys.databaseTables.list('public'),
        })
    }},
  })
}
