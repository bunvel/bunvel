import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import type { TableMetadata } from '@/types/table'
import { formatCellValue } from '@/utils/format'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { DataTableCell } from './data-table-cell'
import { DataTableHeader } from './data-table-header'
import { DataTablePagination } from './data-table-pagination'
import { DataTableSkeleton } from './data-table-skeleton'

interface DataTableProps<TData, TValue = unknown> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  metadata: TableMetadata
  isLoading?: boolean
  error?: unknown
  enableRowSelection?: boolean
  onRowClick?: (row: TData) => void
  onRowSelectionChange?: (selectedRows: Array<TData>) => void
  onRowSelectionStateChange?: (
    updaterOrValue:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => void
  onPaginationChange?: (pagination: {
    pageIndex: number
    pageSize: number
  }) => void
  onSortingChange?: (sorting: SortingState) => void
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
  metadata,
  isLoading = false,
  error,
  enableRowSelection = false,
  onRowClick,
  onRowSelectionChange,
  onRowSelectionStateChange,
  onPaginationChange,
  onSortingChange,
  pageCount,
  state,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Memoize column lookup for performance
  const columnLookup = useMemo(() => {
    const lookup = new Map<string, (typeof metadata.columns)[0]>()
    metadata.columns.forEach((col: any) => {
      lookup.set(col.column_name, col)
    })
    return lookup
  }, [metadata.columns])
  // Add selection column if enabled
  const columnsWithSelection = useMemo(() => {
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
      cell: () => {
        // This is a dummy cell - the actual checkbox is rendered in the main table body
        return null
      },
      size: 50,
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection])

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
    getRowId: (row: any, index: number) => {
      if (metadata?.primary_keys?.length) {
        return metadata.primary_keys
          .map((pk: string) => String(row[pk]))
          .join('::')
      }
      const offset = state.pagination
        ? state.pagination.pageIndex * state.pagination.pageSize
        : 0
      return String(offset + index)
    },
    enableRowSelection,
    onRowSelectionChange: (updaterOrValue) => {
      if (onRowSelectionStateChange) {
        onRowSelectionStateChange(updaterOrValue)
      }
      
      if (onRowSelectionChange) {
        const newRowSelection = typeof updaterOrValue === 'function' ? updaterOrValue(state.rowSelection || {}) : updaterOrValue
        
        const getRowId = (row: any, index: number) => {
          if (metadata?.primary_keys?.length) {
            return metadata.primary_keys.map((pk: string) => String(row[pk])).join('::')
          }
          const offset = state.pagination ? state.pagination.pageIndex * state.pagination.pageSize : 0
          return String(offset + index)
        }
        
        const selectedRows = data.filter((row, index) => {
          const id = getRowId(row, index)
          return newRowSelection[id]
        })
        
        onRowSelectionChange(selectedRows)
      }
    },
    onSortingChange: (updater) => {
      if (onSortingChange) {
        const newSorting =
          typeof updater === 'function' ? updater(state.sorting || []) : updater
        onSortingChange(newSorting)
      }
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(state.pagination) : updater
      onPaginationChange?.(newPagination)
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
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
                        <div className="text-sm">
                          {cell.column.id === 'select' ? (
                            <Checkbox
                              checked={cell.row.getIsSelected()}
                              disabled={!cell.row.getCanSelect()}
                              onCheckedChange={cell.row.getToggleSelectedHandler()}
                              aria-label={`Select row ${cell.row.id}`}
                              className="h-4 w-4 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : cell.column.id === 'empty-column' ? (
                            <div className="p-2"></div>
                          ) : (
                            <DataTableCell
                              value={formatCellValue(
                                cell.getValue(),
                                columnLookup.get(cell.column.id)?.data_type,
                              )}
                              rawValue={cell.getValue()}
                              isForeignKey={
                                columnLookup.get(cell.column.id)
                                  ?.is_foreign_key ?? false
                              }
                              columnMetadata={columnLookup.get(cell.column.id)}
                            />
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
