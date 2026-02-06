import { ColumnKeyIndicator } from '@/components/common/column-key-indicator'
import { cn } from '@/lib/utils'
import type { ColumnMetadata } from '@/types/table'
import { formatDataType } from '@/utils/format'

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
        <ColumnKeyIndicator
          isPrimaryKey={column.is_primary_key}
          isForeignKey={column.is_foreign_key}
        />
      </div>
      <span>{column.column_name}</span>
      <span className="text-xs text-muted-foreground font-normal">
        {formatDataType(column.data_type)}
      </span>
    </div>
  )
}
