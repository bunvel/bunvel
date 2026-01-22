import { TableHead } from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ColumnMetadata } from '@/types/table'
import { formatDataType } from '@/utils/format'
import { Key01Icon, Link02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface CommonTableHeaderProps {
  column: ColumnMetadata
  className?: string
}

export function CommonTableHeader({
  column,
  className = 'border p-2 text-xs',
}: CommonTableHeaderProps) {
  return (
    <TableHead key={column.column_name} className={className}>
      <div className="flex items-center gap-1 group">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <span>
                  {column.is_primary_key && (
                    <HugeiconsIcon
                      icon={Key01Icon}
                      className="h-3.5 w-3.5 text-amber-500"
                    />
                  )}
                </span>
              }
            ></TooltipTrigger>
            {column.is_primary_key && (
              <TooltipContent>
                <p>Primary Key</p>
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <span>
                  {column.is_foreign_key && (
                    <HugeiconsIcon
                      icon={Link02Icon}
                      className="h-3.5 w-3.5 text-blue-500"
                    />
                  )}
                </span>
              }
            ></TooltipTrigger>
            {column.is_foreign_key && (
              <TooltipContent>
                <p>Foreign Key</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
        <span>{column.column_name}</span>
        <span className="text-xs text-muted-foreground font-normal">
          {formatDataType(column.data_type)}
        </span>
      </div>
    </TableHead>
  )
}
