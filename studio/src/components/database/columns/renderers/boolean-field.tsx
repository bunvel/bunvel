import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BaseRendererProps } from '../field-renderer-types'

export function BooleanFieldRenderer({
  column,
  value,
  onChange,
  isDisabled,
  isSubmitting,
  renderFieldLabel,
  renderInputWithForeignKey,
}: BaseRendererProps) {
  return (
    <div
      key={column.column_name}
      className="grid grid-cols-[200px_1fr] gap-4 items-start"
    >
      {renderFieldLabel()}
      {renderInputWithForeignKey(
        <Select
          items={[
            { label: 'TRUE', value: 'TRUE' },
            { label: 'FALSE', value: 'FALSE' },
          ]}
          value={value === null ? '' : value?.toString().toUpperCase() || ''}
          onValueChange={(val) => {
            if (val === '') {
              onChange(column.column_name, null)
            } else {
              onChange(column.column_name, val === 'TRUE')
            }
          }}
          disabled={isSubmitting || isDisabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={value === null ? 'NULL' : 'Select value'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TRUE">TRUE</SelectItem>
            <SelectItem value="FALSE">FALSE</SelectItem>
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
