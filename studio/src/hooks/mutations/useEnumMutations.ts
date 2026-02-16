import { queryClient } from '@/lib/query-client'
import { createEnum, deleteEnum } from '@/services/enum.service'
import type { CreateEnumParams } from '@/types/database'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateEnum() {
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
