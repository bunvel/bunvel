import { TableDataResult, TableMetadata } from '@/types/table'
import { formatCellValue } from '@/utils/format'
import * as React from 'react'
import { CommonTableHeader } from '../common/common-table-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
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
      <div className="p-3 border-b bg-secondary">
        {schemaName}.{tableName}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden border bg-card">
        <div className="overflow-auto max-h-60">
          <Table className="w-auto">
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow className="border-b">
                {displayColumns.map((column) => (
                  <TableHead
                    key={column.column_name}
                    className="border-r"
                    style={{
                      width: 150,
                      minWidth: 150,
                      maxWidth: '350px',
                    }}
                  >
                    <CommonTableHeader column={column} className="p-2" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              {data.data.slice(0, MAX_ROWS).map((row, index) => (
                <TableRow key={index} className="border-b">
                  {displayColumns.map((column) => (
                    <TableCell
                      key={column.column_name}
                      className="border p-2"
                      style={{
                        width: 150,
                        minWidth: 150,
                        maxWidth: '350px',
                      }}
                    >
                      <div className="text-sm">
                        {formatCellValue(row[column.column_name])}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {data.total > MAX_ROWS && (
        <div className="text-xs text-muted-foreground p-3 border-t bg-secondary text-center">
          Showing {Math.min(data.data.length, MAX_ROWS)} of {data.total} records
        </div>
      )}
    </div>
  )
})
