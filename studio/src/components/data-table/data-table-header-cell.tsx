import { ColumnKeyIndicator } from '@/components/common/column-key-indicator'
import { cn } from '@/lib/utils'
import type { ColumnMetadata } from '@/types/table'
import { formatDataType } from '@/utils/format'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Sorting05Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Column } from '@tanstack/react-table'

interface DataTableHeaderCellProps {
  column: ColumnMetadata
  className?: string
  tanstackColumn?: Column<any, unknown>
}

export function DataTableHeaderCell({
  column,
  className,
  tanstackColumn,
}: DataTableHeaderCellProps) {
  const isSorted = tanstackColumn?.getIsSorted()
  const canSort = tanstackColumn?.getCanSort()

  return (
    <div
      key={column.column_name}
      className={cn(
        className,
        'flex items-center gap-1 group/header select-none',
        canSort &&
          'cursor-pointer hover:bg-muted/30 active:bg-muted/50 rounded px-1 -mx-1 py-1 transition-colors',
      )}
      onClick={tanstackColumn?.getToggleSortingHandler()}
    >
      <div className="flex items-center gap-1">
        <ColumnKeyIndicator
          isPrimaryKey={column.is_primary_key}
          isForeignKey={column.is_foreign_key}
        />
      </div>
      <span className="font-semibold text-foreground/90">
        {column.column_name}
      </span>
      <span className="text-xs text-muted-foreground font-normal">
        {formatDataType(column.data_type)}
      </span>

      {/* Sorting Indicators */}
      {canSort && (
        <div className="flex items-center gap-0.5 ml-auto">
          {isSorted ? (
            <div className="flex items-center gap-0.5 text-primary">
              <HugeiconsIcon
                icon={isSorted === 'asc' ? ArrowUp01Icon : ArrowDown01Icon}
                className="h-3 w-3 shrink-0"
                strokeWidth={2.5}
              />
              {tanstackColumn && tanstackColumn.getSortIndex() >= 0 && (
                <span className="flex items-center justify-center bg-primary/10 text-primary rounded-full min-w-3.5 h-3.5 text-[9px] font-bold px-0.5 leading-none">
                  {tanstackColumn.getSortIndex() + 1}
                </span>
              )}
            </div>
          ) : (
            <HugeiconsIcon
              icon={Sorting05Icon}
              className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover/header:opacity-100 transition-all shrink-0"
              strokeWidth={2}
            />
          )}
        </div>
      )}
    </div>
  )
}
