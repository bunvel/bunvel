import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export interface TableFormError {
  message: string
  description?: string
}

export function handleTableFormError(error: unknown): TableFormError {
  let errorMessage = 'Failed to create table'
  let errorDescription = ''

  if (error instanceof Error) {
    errorMessage = error.message

    // Handle specific foreign key type mismatch error
    if (error.message.includes('incompatible types')) {
      errorMessage = 'Foreign key type mismatch'
      errorDescription =
        'The column types in the foreign key relationship are not compatible. Make sure both columns have the same data type.'
    } else if (error.message.includes('foreign key constraint')) {
      errorMessage = 'Foreign key constraint error'
      errorDescription =
        'There is an issue with the foreign key constraint. Please check the referenced table and column exist and have compatible types.'
    }
  }

  logger
    .component('table-form-sheet')
    .error('Error creating table', error)

  return { message: errorMessage, description: errorDescription }
}

export function showTableFormError(error: TableFormError) {
  toast.error(error.message, {
    description: error.description || 'Please check your table configuration and try again.',
  })
}
