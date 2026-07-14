import { InputGroupInput } from '@/components/ui/input-group'
import React from 'react'
import type { BaseRendererProps } from '../field-renderer-types'

export function UuidFieldRenderer({
  column,
  value,
  onChange,
  commonProps,
  renderFieldLabel,
  renderInputWithForeignKey,
}: BaseRendererProps) {
  const fieldType = column.data_type.toLowerCase()
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
          placeholder={
            value === null
              ? 'NULL'
              : column.is_primary_key && fieldType.includes('uuid')
                ? 'Auto-generated UUID'
                : `Enter ${column.column_name}`
          }
          {...commonProps}
        />
      )}
    </div>
  )
}
