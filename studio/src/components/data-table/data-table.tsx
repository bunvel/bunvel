import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import * as React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { formatCellValue } from '@/utils/format'
import { Table, TableBody, TableCell, TableRow } from '../ui/table'
import { DataTableHeader } from './data-table-header'
import { DataTablePagination } from './data-table-pagination'
import { DataTableSkeleton } from './data-table-skeleton'

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  error?: unknown
  enableRowSelection?: boolean
  onRowClick?: (row: TData) => void
  onRowSelectionChange?: (selectedRows: TData[]) => void
  onRowSelectionStateChange?: (
    updaterOrValue:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => void
  onPaginationChange?: (pagination: {
    pageIndex: number
    pageSize: number
  }) => void
  pageCount: number
  state: {
    pagination: { pageIndex: number; pageSize: number }
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
    rowSelection?: Record<string, boolean>
  }
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  isLoading = false,
  error,
  enableRowSelection = false,
  onRowClick,
  onRowSelectionChange,
  onRowSelectionStateChange,
  onPaginationChange,
  pageCount,
  state,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  // Add selection column if enabled
  const columnsWithSelection = React.useMemo(() => {
    if (!enableRowSelection) return columns

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => {
        const isAllSelected = table.getIsAllPageRowsSelected()
        const isSomeSelected = table.getIsSomePageRowsSelected()

        return (
          <Checkbox
            checked={isAllSelected || isSomeSelected}
            onCheckedChange={() =>
              table.toggleAllPageRowsSelected(!isAllSelected)
            }
            className="h-4 w-4"
            aria-checked={isAllSelected || isSomeSelected}
            aria-label="Select all rows"
          />
        )
      },
      cell: ({}) => {
        // This is a dummy cell - the actual checkbox is rendered in the main table body
        return null
      },
      size: 50,
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection])

  // Handle row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange && state.rowSelection) {
      const selectedRows =
        table?.getSelectedRowModel().flatRows.map((row) => row.original) || []
      onRowSelectionChange(selectedRows)
    }
  }, [state.rowSelection, onRowSelectionChange])

  const table = useReactTable({
    data,
    columns: enableRowSelection ? columnsWithSelection : columns,
    state: {
      sorting: state.sorting,
      columnVisibility,
      rowSelection: enableRowSelection ? state.rowSelection : {},
      columnFilters: state.columnFilters,
      pagination: state.pagination,
    },
    enableRowSelection,
    onRowSelectionChange: onRowSelectionStateChange,
    manualPagination: true, // Enable manual pagination
    pageCount,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(state.pagination) : updater
      onPaginationChange?.(newPagination)
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Show skeleton loading state when loading
  if (isLoading) {
    return (
      <DataTableSkeleton
        columns={Math.max(5, columns.length)} // Show at least 5 columns
        rows={10} // Show exactly 10 rows
        enableRowSelection={enableRowSelection}
      />
    )
  }

  // Show error state if there's an error
  if (error) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'An unknown error occurred'

    return (
      <div className="bg-card flex items-center justify-center h-full text-red-500">
        Error loading data: {errorMessage}
      </div>
    )
  }

  return (
    <div className="bg-card flex flex-col h-full">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col overflow-hidden border">
          {table.getRowModel().rows.length === 0 ? (
            <>
              <Table className="w-auto">
                <DataTableHeader table={table} />
              </Table>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">
                  No results found
                </div>
              </div>
            </>
          ) : (
            <Table className="w-auto">
              <DataTableHeader table={table} />

              <TableBody className="overflow-y-auto">
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    className={`border-b ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${
                      enableRowSelection && row.getIsSelected()
                        ? 'bg-muted/30'
                        : ''
                    }`}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border p-2"
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          maxWidth: '350px',
                        }}
                      >
                        <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                          {cell.column.id === 'select' ? (
                            <Checkbox
                              checked={cell.row.getIsSelected()}
                              disabled={!cell.row.getCanSelect()}
                              onCheckedChange={cell.row.getToggleSelectedHandler()}
                              aria-label={`Select row ${cell.row.id}`}
                              className="h-4 w-4 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            formatCellValue(cell.getValue())
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
        <div className="border-t bg-background">
          <DataTablePagination
            table={table}
            enableRowSelection={enableRowSelection}
          />
        </div>
      </div>
    </div>
  )
}
