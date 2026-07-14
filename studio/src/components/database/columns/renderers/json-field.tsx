import { InputGroupTextarea } from '@/components/ui/input-group'
import { TEXTAREA_ROWS_JSON } from '@/utils/field-type-utils'
import { useState } from 'react'
import type { BaseRendererProps } from '../field-renderer-types'

export function JsonFieldRenderer({
  column,
  value,
  onChange,
  commonProps,
  renderFieldLabel,
  renderInputWithForeignKey,
}: BaseRendererProps) {
  const [localValue, setLocalValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const displayValue = isFocused
    ? localValue
    : value === null || value === undefined
      ? ''
      : typeof value === 'string'
        ? value
        : JSON.stringify(value, null, 2)

  return (
    <div
      key={column.column_name}
      className="grid grid-cols-[200px_1fr] gap-4 items-start"
    >
      {renderFieldLabel()}
      {renderInputWithForeignKey(
        <InputGroupTextarea
          id={column.column_name}
          value={displayValue}
          onFocus={() => {
            setLocalValue(displayValue)
            setIsFocused(true)
          }}
          onBlur={() => {
            setIsFocused(false)
            if (localValue.trim()) {
              try {
                const parsed = JSON.parse(localValue)
                onChange(column.column_name, parsed)
              } catch {
                onChange(column.column_name, localValue)
              }
            } else {
              onChange(column.column_name, null)
            }
          }}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={
            value === null ? 'NULL' : `Enter ${column.column_name} (valid JSON)`
          }
          rows={TEXTAREA_ROWS_JSON}
          {...commonProps}
        />
      )}
    </div>
  )
}
