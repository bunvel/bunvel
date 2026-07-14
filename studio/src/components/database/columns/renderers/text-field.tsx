import { InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { TEXTAREA_ROWS_TEXT } from '@/utils/field-type-utils'
import React from 'react'
import type { BaseRendererProps } from '../field-renderer-types'

export function TextFieldRenderer({
  column,
  value,
  onChange,
  commonProps,
  renderFieldLabel,
  renderInputWithForeignKey,
}: BaseRendererProps) {
  const fieldType = column.data_type.toLowerCase()

  // Unbound Text field rendering
  if (fieldType === 'text') {
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        {renderInputWithForeignKey(
          <InputGroupTextarea
            id={column.column_name}
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onChange(column.column_name, e.target.value)
            }
            placeholder={
              value === null ? 'NULL' : `Enter ${column.column_name}`
            }
            {...commonProps}
            rows={TEXTAREA_ROWS_TEXT}
          />
        )}
      </div>
    )
  }

  // Text/Varchar field rendering (Single Line) or Fallback
  return (
    <div
      key={column.column_name}
      className="grid grid-cols-[200px_1fr] gap-4 items-start"
    >
      {renderFieldLabel()}
      {renderInputWithForeignKey(
        <InputGroupInput
          id={column.column_name}
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(column.column_name, e.target.value)
          }
          placeholder={value === null ? 'NULL' : `Enter ${column.column_name}`}
          {...commonProps}
        />
      )}
    </div>
  )
}
