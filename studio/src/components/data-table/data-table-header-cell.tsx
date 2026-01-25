import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ColumnMetadata } from '@/types/table'
import { formatDataType } from '@/utils/format'
import { Key01Icon, Link02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface DataTableHeaderCellProps {
  column: ColumnMetadata
  className?: string
}

export function DataTableHeaderCell({
  column,
  className,
}: DataTableHeaderCellProps) {
  return (
    <div
      key={column.column_name}
      className={cn(className, 'flex items-center gap-1 group')}
    >
      <div className="flex items-center gap-1">
        {column.is_primary_key && (
          <Tooltip>
            <TooltipTrigger
              render={
                <HugeiconsIcon
                  icon={Key01Icon}
                  className="h-3.5 w-3.5 text-amber-500"
                />
              }
            ></TooltipTrigger>
            <TooltipContent>
              <p>Primary Key</p>
            </TooltipContent>
          </Tooltip>
        )}
        {column.is_foreign_key && (
          <Tooltip>
            <TooltipTrigger
              render={
                <span>
                  <HugeiconsIcon
                    icon={Link02Icon}
                    className="h-3.5 w-3.5 text-blue-500"
                  />
                </span>
              }
            ></TooltipTrigger>
            <TooltipContent>
              <p>Foreign Key</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <span>{column.column_name}</span>
      <span className="text-xs text-muted-foreground font-normal">
        {formatDataType(column.data_type)}
      </span>
    </div>
  )
}
