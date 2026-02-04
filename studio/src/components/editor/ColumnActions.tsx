import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ColumnDefinition } from '@/types/database'
import { TABLE_FORM_MESSAGES } from '@/utils/constant'
import { Settings, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface ColumnActionsProps {
  column: ColumnDefinition
  index: number
  onColumnChange: (
    index: number,
    field: keyof ColumnDefinition,
    value: any,
  ) => void
  onDelete: (index: number) => void
  disabled?: boolean
}

export function ColumnActions({
  column,
  index,
  onColumnChange,
  onDelete,
  disabled = false,
}: ColumnActionsProps) {
  return (
    <div className="flex items-center space-x-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 relative"
              disabled={disabled}
            >
              <HugeiconsIcon icon={Settings} className="h-4 w-4" />
              {(() => {
                const checkedCount = [
                  column.isPrimaryKey,
                  column.nullable,
                  column.unique,
                ].filter(Boolean).length
                return checkedCount > 0 ? (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {checkedCount}
                  </Badge>
                ) : null
              })()}
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            checked={column.isPrimaryKey}
            onCheckedChange={(checked) =>
              onColumnChange(index, 'isPrimaryKey', checked === true)
            }
            disabled={disabled}
          >
            {TABLE_FORM_MESSAGES.PRIMARY_KEY}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={column.nullable}
            onCheckedChange={(checked) =>
              onColumnChange(index, 'nullable', checked === true)
            }
            disabled={disabled || column.isPrimaryKey}
          >
            {TABLE_FORM_MESSAGES.NULLABLE}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={column.unique}
            onCheckedChange={(checked) =>
              onColumnChange(index, 'unique', checked === true)
            }
            disabled={disabled}
          >
            {TABLE_FORM_MESSAGES.UNIQUE}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive/90 h-8 w-8 p-0"
        onClick={() => onDelete(index)}
        disabled={disabled}
      >
        <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
      </Button>
    </div>
  )
}
