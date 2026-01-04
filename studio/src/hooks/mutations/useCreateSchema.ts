import { createSchema } from '@/services/schema.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/query-key'

interface CreateSchemaVariables {
  name: string
}

export function useCreateSchema() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: CreateSchemaVariables) => {
      const result = await createSchema({
        data: {
          schemaName: name,
          ifNotExists: true,
        },
      })
      return result
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.schemas.all(),
      })
      return data
    },
    onError: (error: Error) => {
      console.error('Schema creation failed:', error)
      throw error
    },
  })
}
