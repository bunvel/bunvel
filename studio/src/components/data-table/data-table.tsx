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
import React, { ReactNode } from 'react'

export interface ColumnDef<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  dataType?: string
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  currentPage?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  pageSizeOptions?: { value: number; label: string }[]
  showPagination?: boolean
  emptyMessage?: string
  loadingMessage?: string
  className?: string
}

const DEFAULT_PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: Number.MAX_SAFE_INTEGER, label: 'No limit' },
]

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  pageSize = 10,
  onPageSizeChange,
  currentPage = 1,
  onPageChange,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showPagination = true,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  className = '',
}: DataTableProps<T>) {
  const totalPages = Math.ceil((totalItems || data.length) / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems || data.length)

  const renderLoadingState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        {loadingMessage}
      </TableCell>
    </TableRow>
  )

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        {emptyMessage}
      </TableCell>
    </TableRow>
  )

  return (
    <div
      className={`flex flex-col h-full overflow-hidden bg-card ${className}`}
    >
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <Table className="w-full border border-border">
            <TableHeader className="bg-sidebar-accent/50">
              <TableRow className="border-b border-border">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`
                      border-r border-border last:border-r-0 
                      text-foreground font-medium ${column.className || ''}
`}
                  >
                    <div className="flex flex-col">
                      <span>
                        {column.header}{' '}
                        {column.dataType && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {column.dataType}
                          </span>
                        )}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? renderLoadingState()
                : data.length === 0
                  ? renderEmptyState()
                  : data.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="border-b border-border last:border-b-0"
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={`${column.key}-${rowIndex}`}
                            className={`
                              border-r border-border last:border-r-0 
                              text-muted-foreground ${column.className || ''}
                            `}
                          >
                            {column.cell(row) !== null &&
                            typeof column.cell(row) === 'object' &&
                            !React.isValidElement(column.cell(row)) ? (
                              <div className="flex items-center">
                                <span className="font-mono text-xs bg-muted/20 px-2 py-1 rounded truncate max-w-[200px] inline-block">
                                  {(() => {
                                    try {
                                      return JSON.stringify(
                                        column.cell(row),
                                        (_, value) => {
                                          // Handle circular references
                                          if (
                                            typeof value === 'object' &&
                                            value !== null
                                          ) {
                                            // Return a clean object without React internals
                                            if (
                                              value.constructor.name ===
                                                'Object' ||
                                              Array.isArray(value)
                                            ) {
                                              return value
                                            }
                                            return `[${value.constructor.name}]`
                                          }
                                          return value
                                        },
                                      )
                                    } catch (e) {
                                      return '[Complex Object]'
                                    }
                                  })()}
                                </span>
                              </div>
                            ) : (
                              column.cell(row)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">Rows per page:</div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    {pageSize === Number.MAX_SAFE_INTEGER
                      ? 'No limit'
                      : pageSize}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                {pageSizeOptions.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    onClick={() => onPageSizeChange?.(size.value)}
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-muted-foreground">
              {pageSize !== Number.MAX_SAFE_INTEGER
                ? `Showing ${startIndex + 1}-${endIndex} of ${totalItems || data.length}`
                : `Showing all ${totalItems || data.length}`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
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
                onClick={() => onPageChange?.(currentPage + 1)}
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

export default DataTable
