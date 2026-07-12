import type { TableDataResult, TableMetadata } from '@/types/table'
import { formatCellValue } from '@/utils/format'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableHeaderCell } from './data-table-header-cell'

interface RelatedDataTableProps {
  data: TableDataResult | undefined
  metadata: TableMetadata | undefined
  isLoading: boolean
  error: unknown
  tableName: string
  schemaName: string
}

export const RelatedDataTable = function RelatedDataTable({
  data,
  metadata,
  isLoading,
  error,
  tableName,
  schemaName,
}: RelatedDataTableProps) {
  return (
    <div className="w-[600px] max-h-[500px] flex flex-col bg-background border rounded-lg overflow-hidden">
      <div className="p-4 text-xs text-muted-foreground bg-secondary border-b shrink-0">
        Referencing record from
        <span className="text-sm text-foreground font-medium">
          {' '}
          {schemaName}.{tableName}
        </span>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-card min-h-[150px] *:data-[slot=table-container]:flex-1 *:data-[slot=table-container]:overflow-auto!">
          {isLoading ? (
            <div className="p-4 text-center">
              <Spinner />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <div className="text-xs text-red-500">
                Error loading related data
              </div>
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-2xl mb-2">🔗</div>
              <div className="text-sm font-medium text-muted-foreground">
                No related records found
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                This {schemaName}.{tableName} has no matching records
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-secondary">
                <TableRow className="border-b">
                  {metadata?.columns.map((column) => (
                    <TableHead
                      key={column.column_name}
                      className="border-r whitespace-nowrap"
                      style={{
                        width: 200,
                        minWidth: 200,
                        maxWidth: '400px',
                      }}
                    >
                      <DataTableHeaderCell column={column} className="p-3" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-y-auto">
                {data.data.map((row, index) => (
                  <TableRow key={index} className="border-b">
                    {metadata?.columns.map((column) => (
                      <TableCell
                        key={column.column_name}
                        className="border p-3 px-4 whitespace-nowrap"
                        style={{
                          width: 200,
                          minWidth: 200,
                          maxWidth: '400px',
                        }}
                      >
                        <div className="text-sm">
                          {formatCellValue(
                            row[column.column_name],
                            column.data_type,
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </div>
    </div>
  )
}
