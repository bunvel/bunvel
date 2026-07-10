import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PLACEHOLDERS } from '@/constants/ui'
import type { ColumnDefinition } from '@/types/database'

interface ColumnFieldProps {
  column: ColumnDefinition
  index: number
  allDataTypes: Array<{ value: string; label: string }>
  onColumnChange: (
    index: number,
    field: keyof ColumnDefinition,
    value: any,
  ) => void
  disabled?: boolean
}

export function ColumnField({
  column,
  index,
  allDataTypes,
  onColumnChange,
  disabled = false,
}: ColumnFieldProps) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      {/* Column Name */}
      <div className="col-span-4">
        <Input
          value={column.name}
          onChange={(e) => onColumnChange(index, 'name', e.target.value)}
          placeholder={PLACEHOLDERS.COLUMN_NAME}
          required
          disabled={disabled}
        />
      </div>

      {/* Data Type */}
      <div className="col-span-3">
        <Select
          items={allDataTypes}
          value={column.type}
          onValueChange={(value) => onColumnChange(index, 'type', value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-60">
            {allDataTypes.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Default Value */}
      <div className="col-span-3">
        <Input
          value={column.defaultValue || ''}
          onChange={(e) =>
            onColumnChange(index, 'defaultValue', e.target.value)
          }
          placeholder={PLACEHOLDERS.OPTIONAL}
          disabled={disabled}
        />
      </div>

      {/* Actions - col-span-1 for actions */}
      <div className="col-span-1">
        {/* Actions will be handled by parent component */}
      </div>
    </div>
  )
}
