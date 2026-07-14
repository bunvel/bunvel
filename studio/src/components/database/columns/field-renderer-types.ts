import type { ColumnMetadata } from '@/types/table'
import React from 'react'

export interface FieldRendererProps {
  column: ColumnMetadata
  value: any
  isSubmitting: boolean
  mode: 'insert' | 'edit'
  enumValuesMap: Record<string, Array<string>>
  onChange: (column: string, value: any) => void
  onReferenceSelectorOpen: (column: ColumnMetadata) => void
}

export interface BaseRendererProps {
  column: ColumnMetadata
  value: any
  onChange: (column: string, value: any) => void
  isDisabled: boolean
  isSubmitting: boolean
  commonProps: {
    disabled: boolean
    required: boolean
  }
  renderFieldLabel: () => React.ReactNode
  renderInputWithForeignKey: (
    inputElement: React.ReactNode,
    options?: { disableDropdown?: boolean; wrapInInputGroup?: boolean }
  ) => React.ReactNode
}
