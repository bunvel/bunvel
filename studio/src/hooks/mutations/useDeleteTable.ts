import { deleteTable } from '@/services/schema.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useDeleteTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { schema: string; table: string; cascade: boolean }) =>
      deleteTable({data: params}),
    onSuccess: (_, { schema }) => {
      // Invalidate and refetch tables query
      queryClient.invalidateQueries({ queryKey: ['tables', schema] })
      toast.success('Table deleted successfully')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error('Failed to delete table', {
        description: errorMessage,
      })
    },
  })
}
