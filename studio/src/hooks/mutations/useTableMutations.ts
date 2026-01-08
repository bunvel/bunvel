import { createTable, CreateTableParams } from '@/services/schema.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '../queries/query-key'

export function useCreateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateTableParams) => createTable({ data: params }),
    onSuccess: (_, { schema }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tables.list(schema) 
      })
      toast.success('Table created successfully')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create table'
      toast.error('Error creating table', {
        description: errorMessage,
      })
    },
  })
}
