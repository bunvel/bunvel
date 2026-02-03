import { useRelatedTableData } from '@/hooks/queries/useRelatedTableData'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { ColumnMetadata } from '@/types/table'
import { ArrowRight } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RelatedDataTable } from './related-data-table'

import { Button } from '@/components/ui/button'

interface DataTableCellProps {
  value: React.ReactNode
  rawValue: unknown
  isForeignKey: boolean
  columnMetadata?: ColumnMetadata
}

export const DataTableCell = function DataTableCell({
  value,
  rawValue,
  isForeignKey,
  columnMetadata,
}: DataTableCellProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  // Only fetch related data when popover is opened and this is a valid foreign key
  const shouldFetch = Boolean(
    isPopoverOpen &&
    isForeignKey &&
    columnMetadata?.foreign_table_schema &&
    columnMetadata?.foreign_table_name &&
    columnMetadata?.foreign_column_name &&
    rawValue !== null &&
    rawValue !== undefined &&
    rawValue !== '',
  )

  const {
    data: relatedData,
    isLoading,
    error,
  } = useRelatedTableData({
    foreignKeyColumn: columnMetadata!,
    foreignKeyValue: rawValue as string | number | null,
    enabled: shouldFetch,
  })

  // Get metadata for the related table (only when needed)
  const { data: relatedMetadata } = useTableMetadata(
    shouldFetch ? columnMetadata?.foreign_table_schema : undefined,
    shouldFetch ? columnMetadata?.foreign_table_name : undefined,
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsPopoverOpen(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 w-full whitespace-nowrap">
      <span className="truncate flex-1 min-w-0">{value}</span>
      {isForeignKey &&
      rawValue !== null &&
      rawValue !== undefined &&
      rawValue !== '' ? (
        <Popover>
          <PopoverTrigger
            render={<Button variant="secondary" size="icon-xs" />}
          >
            <HugeiconsIcon icon={ArrowRight} />
          </PopoverTrigger>
          <PopoverContent
            align="center"
            className="p-0"
            onKeyDown={handleKeyDown}
          >
            <RelatedDataTable
              data={relatedData}
              metadata={relatedMetadata}
              isLoading={isLoading}
              error={error}
              tableName={columnMetadata?.foreign_table_name!}
              schemaName={columnMetadata?.foreign_table_schema!}
            />
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}
