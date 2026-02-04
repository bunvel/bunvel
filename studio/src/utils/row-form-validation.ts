import type { TableMetadata } from '@/types/table'

export interface FormValues {
  [key: string]: string | number | boolean | null | any[]
}

export interface ValidationResult {
  isValid: boolean
  values: FormValues
  requiredField?: string
}

export const validateRowForm = (
  formValues: FormValues,
  metadata: TableMetadata | undefined,
  mode: 'insert' | 'edit',
): ValidationResult => {
  if (!metadata?.columns) {
    return { isValid: false, values: {} }
  }

  const result: FormValues = {}

  for (const column of metadata.columns) {
    const value = formValues[column.column_name]

    // For edit mode, include primary keys in the result for WHERE clause (even if identity)
    if (mode === 'edit' && column.is_primary_key) {
      result[column.column_name] = value
      continue
    }

    // Skip identity columns for insert mode and non-primary key identity columns for edit mode
    if (column.is_identity === 'YES') continue

    // For edit mode, include all values including NULL to allow clearing fields
    if (mode === 'edit') {
      result[column.column_name] = value
    } else if (value !== undefined && value !== '') {
      // For insert mode, include non-empty values (including explicit null)
      result[column.column_name] = value
    } else if (
      mode === 'insert' &&
      column.is_nullable === 'NO' &&
      column.column_default === null &&
      (value === undefined || value === '')
    ) {
      // Only show error for required fields that are truly empty
      return { isValid: false, values: {}, requiredField: column.column_name }
    }
  }

  return { isValid: true, values: result }
}

export const hasRequiredFields = (values: FormValues): boolean => {
  return Object.keys(values).length > 0
}
