import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface TableViewerProps {
  table: string
  columns: string[]
  data: Record<string, any>[]
  isLoading: boolean
  onPageChange: (page: number) => void
  currentPage: number
  totalPages: number
  onPageSizeChange: (size: number) => void
  pageSize: number
}

export const TableViewer = ({
  table,
  columns,
  data,
  isLoading,
  onPageChange,
  currentPage,
  totalPages,
  onPageSizeChange,
  pageSize,
}: TableViewerProps) => {
  if (isLoading) {
    return (
      <div className="bg-card flex items-center justify-center h-full text-muted-foreground">
        Loading table data...
      </div>
    )
  }

  if (!table) {
    return (
      <div className="bg-card flex items-center justify-center h-full text-muted-foreground">
        Select a table to view its data
      </div>
    )
  }

  const pageSizes = [
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
    { value: Number.MAX_SAFE_INTEGER, label: 'No limit' },
  ]

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <Table className="w-full border border-border">
            <TableHeader className="bg-sidebar-accent/50">
              <TableRow className="border-b border-border">
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="border-r border-border last:border-r-0 text-foreground font-medium"
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.slice(startIndex, endIndex).map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="border-b border-border last:border-b-0"
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${rowIndex}-${column}`}
                        className="font-mono text-sm border-r border-border last:border-r-0 text-muted-foreground"
                      >
                        {typeof row[column] === 'object'
                          ? JSON.stringify(row[column])
                          : String(row[column] ?? 'NULL')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground p-4"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      {data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">Rows per page:</div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    {pageSize === Number.MAX_SAFE_INTEGER ? 'No limit' : pageSize}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {pageSizes.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    onClick={() => onPageSizeChange(size.value)}
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-muted-foreground">
              {pageSize && pageSize !== Number.MAX_SAFE_INTEGER
                ? `Showing ${startIndex + 1}-${endIndex} of ${data.length} rows`
                : `Showing all ${data.length} rows`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableViewer
