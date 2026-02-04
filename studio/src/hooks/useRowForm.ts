import { useCreateRow } from '@/hooks/mutations/useCreateRow'
import { useUpdateRow } from '@/hooks/mutations/useUpdateRow'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import type { FormValues, ValidationResult } from '@/utils/row-form-validation'
import { hasRequiredFields, validateRowForm } from '@/utils/row-form-validation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UseRowFormProps {
  schema: string
  table: string
  mode: 'insert' | 'edit'
  initialData?: Record<string, any>
}

export const useRowForm = ({
  schema,
  table,
  mode,
  initialData = {},
}: UseRowFormProps) => {
  const [formValues, setFormValues] = useState<FormValues>({})
  const { mutate: createRow, isPending: isCreatePending } = useCreateRow()
  const { mutate: updateRow, isPending: isUpdatePending } = useUpdateRow()
  const isSubmitting = isCreatePending || isUpdatePending
  const { data: metadata } = useTableMetadata(schema, table)

  const resetForm = useCallback(() => {
    setFormValues(mode === 'edit' ? { ...initialData } : {})
  }, [mode, initialData])

  // Initialize form with initial data when mode changes or initial data changes
  useEffect(() => {
    if (mode === 'edit' && Object.keys(initialData).length > 0) {
      setFormValues({ ...initialData })
    }
  }, [mode, initialData])

  const handleInputChange = useCallback((column: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [column]: value,
    }))
  }, [])

  const validateForm = useCallback((): ValidationResult => {
    if (!metadata) {
      toast.error('Table metadata not available')
      return { isValid: false, values: {} }
    }

    const validation = validateRowForm(formValues, metadata, mode)

    if (!validation.isValid) {
      if (validation.requiredField) {
        toast.error(`Field "${validation.requiredField}" is required`)
      } else {
        toast.error('At least one field value is required')
      }
      return validation
    }

    if (!hasRequiredFields(validation.values)) {
      toast.error('At least one field value is required')
      return { isValid: false, values: {} }
    }

    return validation
  }, [formValues, metadata, mode])

  const handleSubmit = useCallback(
    async (onSuccess?: () => void) => {
      const validation = validateForm()

      if (!validation.isValid) {
        return
      }

      if (mode === 'insert') {
        createRow(
          { schema, table, row: validation.values },
          {
            onSuccess: () => {
              onSuccess?.()
              resetForm()
            },
          },
        )
      } else {
        // Extract primary keys from metadata if not available
        const primaryKeys = metadata?.primary_keys?.length
          ? metadata.primary_keys
          : metadata?.columns
              ?.filter((col) => col.is_primary_key)
              .map((col) => col.column_name) || []

        updateRow(
          { schema, table, row: validation.values, primaryKeys },
          {
            onSuccess: () => {
              onSuccess?.()
              resetForm()
            },
          },
        )
      }
    },
    [
      validateForm,
      mode,
      schema,
      table,
      metadata,
      createRow,
      updateRow,
      resetForm,
    ],
  )

  return {
    formValues,
    setFormValues,
    handleInputChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    metadata,
  }
}
