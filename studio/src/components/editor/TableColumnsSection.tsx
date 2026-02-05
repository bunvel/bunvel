import { DataTypeSelector } from '@/components/common/data-type-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ColumnDefinition } from '@/types/database'
import { PLACEHOLDERS, TABLE_FORM_MESSAGES } from '@/utils/constant'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ColumnActions } from './ColumnActions'

interface TableColumnsSectionProps {
  columns: ColumnDefinition[]
  allDataTypes: Array<{ value: string; label: string }>
  onColumnChange: (
    index: number,
    field: keyof ColumnDefinition,
    value: any,
  ) => void
  onAddColumn: () => void
  onDeleteColumn: (index: number) => void
  disabled?: boolean
}

export function TableColumnsSection({
  columns,
  allDataTypes,
  onColumnChange,
  onAddColumn,
  onDeleteColumn,
  disabled = false,
}: TableColumnsSectionProps) {
  return (
    <div className="space-y-4 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          {TABLE_FORM_MESSAGES.TABLE_COLUMNS}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {TABLE_FORM_MESSAGES.DEFINE_TABLE_STRUCTURE}
        </p>
      </div>

      {/* Columns List */}
      <div className="space-y-4">
        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 pb-2 border-b">
          <div className="col-span-4">
            <Label className="text-sm font-medium">
              {TABLE_FORM_MESSAGES.COLUMN_NAME}
            </Label>
          </div>
          <div className="col-span-3">
            <Label className="text-sm font-medium">
              {TABLE_FORM_MESSAGES.DATA_TYPE}
            </Label>
          </div>
          <div className="col-span-3">
            <Label className="text-sm font-medium">
              {TABLE_FORM_MESSAGES.DEFAULT}
            </Label>
          </div>
          <div className="col-span-1 hidden">
            <Label className="text-sm font-medium">Actions</Label>
          </div>
        </div>

        {/* Column Rows */}
        <div className="space-y-4">
          {columns.map((column, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              {/* Column Name */}
              <div className="col-span-4">
                <Input
                  value={column.name}
                  onChange={(e) =>
                    onColumnChange(index, 'name', e.target.value)
                  }
                  placeholder={PLACEHOLDERS.COLUMN_NAME}
                  required
                  disabled={disabled}
                />
              </div>

              {/* Data Type */}
              <div className="col-span-3">
                <DataTypeSelector
                  value={column.type}
                  onChange={(value) =>
                    value && onColumnChange(index, 'type', value)
                  }
                  dataTypes={allDataTypes}
                  disabled={disabled}
                />
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

              {/* Actions */}
              <div className="col-span-1 flex items-center space-x-1">
                <ColumnActions
                  column={column}
                  index={index}
                  onColumnChange={onColumnChange}
                  onDelete={onDeleteColumn}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddColumn}
              disabled={disabled}
              className="w-full"
            >
              <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
              {TABLE_FORM_MESSAGES.ADD_COLUMN}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
