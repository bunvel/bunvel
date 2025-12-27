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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  RowData,
  useReactTable
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useMemo } from 'react'

// This type is now compatible with TanStack Table's ColumnDef
export type TableColumnDef<T> = ColumnDef<T, any>

// Extend the RowData type to include our custom properties
declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    key?: string
    className?: string
    dataType?: string
  }
}

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[]
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
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (selection: Record<string, boolean>) => void
}

const DEFAULT_PAGE_SIZE_OPTIONS = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
]

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  pageSize = 50,
  onPageSizeChange,
  currentPage = 1,
  onPageChange,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showPagination = true,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  className = '',
  rowSelection = {},
  onRowSelectionChange,
}: DataTableProps<T>) {
  const memoizedData = useMemo(() => data, [data])
  const memoizedColumns = useMemo(() => columns, [columns])

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalItems || data.length) / pageSize),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
      rowSelection,
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: currentPage - 1, pageSize })
        : updater
      
      if (onPageChange && newPagination.pageIndex + 1 !== currentPage) {
        onPageChange(newPagination.pageIndex + 1)
      }
      if (onPageSizeChange && newPagination.pageSize !== pageSize) {
        onPageSizeChange(newPagination.pageSize)
      }
    },
    onRowSelectionChange: (updater) => {
      if (onRowSelectionChange) {
        const newSelection = typeof updater === 'function' 
          ? updater(rowSelection) 
          : updater
        onRowSelectionChange(newSelection)
      }
    },
    getRowId: (row) => row.id ? String(row.id) : `row-${Math.random().toString(36).substr(2, 9)}`,
  })

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
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <Table className="w-full border border-border">
            <TableHeader className="bg-sidebar-accent/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`
                        border-r border-border last:border-r-0 
                        text-foreground font-medium 
                        ${header.column.columnDef.meta?.className || ''}
                      `}
                    >
                      <div className="flex flex-col">
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.columnDef.meta?.dataType && (
                            <span className="text-xs font-normal text-muted-foreground">
                              {header.column.columnDef.meta.dataType}
                            </span>
                          )}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderLoadingState()
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border last:border-b-0"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellValue = cell.getValue()
                      const columnDef = columns.find(col => col.id === cell.column.id)
                      
                      return (
                        <TableCell
                          key={cell.id}
                          className={`
                            border-r border-border last:border-r-0 
                            text-muted-foreground ${columnDef?.meta?.className || ''}
                          `}
                        >
                          {cellValue !== null &&
                          typeof cellValue === 'object' &&
                          !React.isValidElement(cellValue) ? (
                            <div className="flex items-center">
                              <span className="font-mono text-xs bg-muted/20 px-2 py-1 rounded truncate max-w-[200px] inline-block">
                                {(() => {
                                  try {
                                    return JSON.stringify(
                                      cellValue,
                                      (_, value) => {
                                        if (typeof value === 'object' && value !== null) {
                                          if (value.constructor.name === 'Object' || Array.isArray(value)) {
                                            return value
                                          }
                                          return `[${value.constructor.name}]`
                                        }
                                        return value
                                      }
                                    )
                                  } catch (e) {
                                    return '[Complex Object]'
                                  }
                                })()}
                              </span>
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                renderEmptyState()
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">Rows per page:</div>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8 px-2">
                  {table.getState().pagination.pageSize === Number.MAX_SAFE_INTEGER
                    ? 'No limit'
                    : table.getState().pagination.pageSize}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>}>
                
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {pageSizeOptions.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    onClick={() => {
                      table.setPageSize(size.value)
                      onPageSizeChange?.(size.value)
                    }}
                    className={size.value === table.getState().pagination.pageSize ? 'bg-accent' : ''}
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                table.setPageIndex(0)
                onPageChange?.(1)
              }}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              <span className="sr-only">First page</span>
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                table.previousPage()
                onPageChange?.(table.getState().pagination.pageIndex + 1)
              }}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                table.nextPage()
                onPageChange?.(table.getState().pagination.pageIndex + 1)
              }}
              disabled={!table.getCanNextPage() || isLoading}
            >
              <span className="sr-only">Next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const lastPage = table.getPageCount() - 1
                table.setPageIndex(lastPage)
                onPageChange?.(lastPage + 1)
              }}
              disabled={!table.getCanNextPage() || isLoading}
            >
              <span className="sr-only">Last page</span>
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
