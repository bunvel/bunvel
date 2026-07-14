import { InputGroupTextarea } from '@/components/ui/input-group'
import {
  TEXTAREA_ROWS_TEXT,
  formatArrayValue,
  parseArrayInput,
} from '@/utils/field-type-utils'
import type { BaseRendererProps } from '../field-renderer-types'

export function ArrayFieldRenderer({
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
        <InputGroupTextarea
          id={column.column_name}
          value={formatArrayValue(value)}
          onChange={(e) => {
            const val = e.target.value
            if (val === '') {
              onChange(column.column_name, null)
            } else {
              const parsedItems = parseArrayInput(val, fieldType)
              onChange(column.column_name, parsedItems)
            }
          }}
          placeholder={
            value === null
              ? 'NULL'
              : `Enter ${column.column_name} as [item1, item2, item3] or one value per line`
          }
          {...commonProps}
          rows={TEXTAREA_ROWS_TEXT}
        />
      )}
    </div>
  )
}
