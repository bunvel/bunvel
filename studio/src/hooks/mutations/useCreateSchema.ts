import { queryClient } from '@/lib/query-client'
import { createSchema } from '@/services/schema.service'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'

interface CreateSchemaVariables {
  name: string
}

export function useCreateSchema() {
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
  })
}
