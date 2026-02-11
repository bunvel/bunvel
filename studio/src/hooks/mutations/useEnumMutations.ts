import { reactQueryKeys } from '@/hooks/queries/react-query-keys'
import { createEnum, deleteEnum } from '@/services/enum.service'
import type { CreateEnumParams } from '@/types/database'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateEnum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateEnumParams) => createEnum({ data: params }),
    onSuccess: (_, { schema }) => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.enums.list(schema),
      })
      toast.success('Enum created successfully')
    },
  })
}

export function useDeleteEnum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { schema: string; enumName: string }) =>
      deleteEnum({ data: params }),
    onSuccess: (_, { schema }) => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.enums.list(schema),
      })
      toast.success('Enum deleted successfully')
    },
  })
}
