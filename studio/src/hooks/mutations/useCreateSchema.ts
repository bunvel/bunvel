import { createSchema } from '@/services/schema.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reactQueryKeys } from '../queries/react-query-keys'

interface CreateSchemaVariables {
  name: string
}

export function useCreateSchema() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: CreateSchemaVariables) => {
      const result = await createSchema({
        data: name,
      })
      return result
    },
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.schemas.list(),
      })
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.databaseTables.list(name),
      })
    },
    onError: (error: Error) => {
      console.error('Schema creation failed:', error)
    },
  })
}
