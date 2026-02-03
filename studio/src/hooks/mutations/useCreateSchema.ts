import { reactQueryKeys } from '@/hooks/queries/react-query-keys'
import { logger } from '@/lib/logger'
import { createSchema } from '@/services/schema.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
        queryKey: reactQueryKeys.schemas.list(),
      })
    },
    onError: (error: Error) => {
      logger.hook('use-create-schema').error('Schema creation failed', error)
    },
  })
}
