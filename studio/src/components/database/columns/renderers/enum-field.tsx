import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BaseRendererProps } from '../field-renderer-types'

interface EnumFieldRendererProps extends BaseRendererProps {
  enumValuesMap: Record<string, Array<string>>
}

export function EnumFieldRenderer({
  column,
  value,
  onChange,
  isDisabled,
  isSubmitting,
  renderFieldLabel,
  renderInputWithForeignKey,
  enumValuesMap,
}: EnumFieldRendererProps) {
  const enumValues = enumValuesMap[column.data_type] || []
  return (
    <div
      key={column.column_name}
      className="grid grid-cols-[200px_1fr] gap-4 items-start"
    >
      {renderFieldLabel()}
      {renderInputWithForeignKey(
        <Select
          items={enumValues.map((v) => ({ label: v, value: v }))}
          value={value === null ? '' : value?.toString() || ''}
          onValueChange={(val) => {
            if (val === '') {
              onChange(column.column_name, null)
            } else {
              onChange(column.column_name, val)
            }
          }}
          disabled={isSubmitting || isDisabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                value === null ? 'NULL' : `Select ${column.column_name}`
              }
            />
          </SelectTrigger>
          <SelectContent>
            {enumValues.map((enumValue) => (
              <SelectItem key={enumValue} value={enumValue}>
                {enumValue}
              </SelectItem>
            ))}
            {column.is_nullable === 'YES' && (
              <SelectItem value="">NULL</SelectItem>
            )}
          </SelectContent>
        </Select>,
        { disableDropdown: true, wrapInInputGroup: false }
      )}
    </div>
  )
}
