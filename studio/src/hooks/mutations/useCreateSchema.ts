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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.schemas.all(),
      })
    },
    onError: (error: Error) => {
      console.error('Schema creation failed:', error)
    },
  })
}
