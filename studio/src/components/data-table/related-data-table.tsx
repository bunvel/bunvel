import { TableDataResult, TableMetadata } from '@/types/table'
import { formatCellValue } from '@/utils/format'
import { Key01Icon, Link02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as React from 'react'
import { CommonTableHeader } from '../common/common-table-header'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table'
import { DataTableSkeleton } from './data-table-skeleton'

interface RelatedDataTableProps {
  data: TableDataResult | undefined
  metadata: TableMetadata | undefined
  isLoading: boolean
  error: unknown
  tableName: string
  schemaName: string
}

const MAX_ROWS = 10

export const RelatedDataTable = React.memo(function RelatedDataTable({
  data,
  metadata,
  isLoading,
  error,
  tableName,
  schemaName,
}: RelatedDataTableProps) {
  if (isLoading) {
    return (
      <div className="w-[500px] max-h-80 bg-background border rounded-lg">
        <div className="p-3 border-b">
          <div className="text-sm font-medium">
            {schemaName}.{tableName}
          </div>
        </div>
        <div className="p-4">
          <DataTableSkeleton columns={4} rows={3} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-[500px] max-h-80 bg-background border rounded-lg">
        <div className="p-3 border-b">
          <div className="text-sm font-medium">
            {schemaName}.{tableName}
          </div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xs text-red-500">Error loading related data</div>
        </div>
      </div>
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="w-[500px] max-h-80 bg-background border rounded-lg">
        <div className="p-3 border-b">
          <div className="text-sm font-medium">
            {schemaName}.{tableName}
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="text-2xl mb-2">🔗</div>
          <div className="text-sm font-medium text-muted-foreground">
            No related records found
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            This {schemaName}.{tableName} has no matching records
          </div>
        </div>
      </div>
    )
  }

  // Get first few columns to display (limit to 4 columns for compact view)
  const displayColumns = metadata?.columns.slice(0, 4) || []

  return (
    <div className="w-[500px] max-h-80 bg-background border rounded-lg overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="text-sm font-medium flex items-center gap-2">
          <span>
            {schemaName}.{tableName}
          </span>
          <div className="flex items-center gap-1">
            {metadata?.primary_keys.map((pk) => (
              <div key={pk} className="flex items-center gap-1">
                <HugeiconsIcon
                  icon={Key01Icon}
                  className="h-3.5 w-3.5 text-amber-500"
                />
              </div>
            ))}
            {metadata?.foreign_keys.map((fk) => (
              <div key={fk.column_name} className="flex items-center gap-1">
                <HugeiconsIcon
                  icon={Link02Icon}
                  className="h-3.5 w-3.5 text-blue-500"
                />
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            ({data.total} records)
          </span>
        </div>
      </div>
      <div className="overflow-auto max-h-60">
        <Table>
          <TableHeader>
            <TableRow>
              {displayColumns.map((column) => (
                <CommonTableHeader
                  key={column.column_name}
                  column={column}
                  className="text-xs p-3 font-medium bg-muted/50 border-r border-b"
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.slice(0, MAX_ROWS).map((row, index) => (
              <TableRow key={index} className="border-b">
                {displayColumns.map((column) => (
                  <TableCell
                    key={column.column_name}
                    className="text-xs p-3 border-r"
                  >
                    <div className="max-w-48 truncate">
                      {formatCellValue(row[column.column_name])}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.total > MAX_ROWS && (
        <div className="text-xs text-muted-foreground p-3 border-t bg-muted/30 text-center">
          Showing {Math.min(data.data.length, MAX_ROWS)} of {data.total} records
        </div>
      )}
    </div>
  )
})
