import { createEnum, deleteEnum } from '@/services/enum.service'
import type { CreateEnumParams } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reactQueryKeys } from '@/hooks/queries/react-query-keys'

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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create enum'
      toast.error('Error creating enum', {
        description: errorMessage,
      })
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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete enum'
      toast.error('Error deleting enum', {
        description: errorMessage,
      })
    },
  })
}
