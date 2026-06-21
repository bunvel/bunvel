import { ColumnKeyIndicator } from '@/components/common/column-key-indicator'
import { cn } from '@/lib/utils'
import type { ColumnMetadata, SortConfig } from '@/types/table'
import { formatDataType } from '@/utils/format'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Sorting05Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface DataTableHeaderCellProps {
  column: ColumnMetadata
  className?: string
  sorts?: Array<SortConfig>
  onSortChange?: (sorts: Array<SortConfig>) => void
}

export function DataTableHeaderCell({
  column,
  className,
  sorts = [],
  onSortChange,
}: DataTableHeaderCellProps) {
  const sortIndex = sorts.findIndex((s) => s.column === column.column_name)
  const activeSort = sortIndex !== -1 ? sorts[sortIndex] : null
  const isSorted = activeSort !== null
  const sortDirection = activeSort ? activeSort.direction : null

  const handleClick = (e: React.MouseEvent) => {
    if (!onSortChange) return

    const columnName = column.column_name
    const isShiftKey = e.shiftKey
    let newSorts: Array<SortConfig> = []

    if (isShiftKey) {
      // Multi-column sorting: modify or append
      const existingIndex = sorts.findIndex((s) => s.column === columnName)

      if (existingIndex !== -1) {
        const existingSort = sorts[existingIndex]
        if (existingSort.direction === 'asc') {
          // Toggle to desc
          newSorts = sorts.map((s, idx) =>
            idx === existingIndex ? { ...s, direction: 'desc' as const } : s,
          )
        } else {
          // Remove from sorting
          newSorts = sorts.filter((s) => s.column !== columnName)
        }
      } else {
        // Append new sort
        newSorts = [...sorts, { column: columnName, direction: 'asc' as const }]
      }
    } else {
      // Single-column sorting: clear all others and set/toggle this column
      const existing = sorts.find((s) => s.column === columnName)
      if (existing) {
        if (existing.direction === 'asc') {
          newSorts = [{ column: columnName, direction: 'desc' as const }]
        } else {
          // Clear sorting (unsorted)
          newSorts = []
        }
      } else {
        newSorts = [{ column: columnName, direction: 'asc' as const }]
      }
    }

    onSortChange(newSorts)
  }

  return (
    <div
      key={column.column_name}
      className={cn(
        className,
        'flex items-center gap-1 group/header select-none',
        onSortChange &&
          'cursor-pointer hover:bg-muted/30 active:bg-muted/50 rounded px-1 -mx-1 py-1 transition-colors',
      )}
      onClick={handleClick}
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
      {onSortChange && (
        <div className="flex items-center gap-0.5 ml-auto">
          {isSorted ? (
            <div className="flex items-center gap-0.5 text-primary">
              <HugeiconsIcon
                icon={sortDirection === 'asc' ? ArrowUp01Icon : ArrowDown01Icon}
                className="h-3 w-3 shrink-0"
                strokeWidth={2.5}
              />
              {sorts.length > 1 && (
                <span className="flex items-center justify-center bg-primary/10 text-primary rounded-full min-w-3.5 h-3.5 text-[9px] font-bold px-0.5 leading-none">
                  {sortIndex + 1}
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
