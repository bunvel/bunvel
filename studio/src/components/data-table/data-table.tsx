import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import type { TableMetadata } from '@/types/table'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
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
  totalCount?: number
  state: {
    pagination: { pageIndex: number; pageSize: number }
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
    rowSelection?: Record<string, boolean>
  }
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
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
  totalCount,
  state,
  manualPagination = true,
  manualSorting = true,
  manualFiltering = true,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={row.getToggleSelectedHandler()}
            aria-label={`Select row ${row.id}`}
            className="h-4 w-4 shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        )
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
        const newRowSelection =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(state.rowSelection || {})
            : updaterOrValue

        const getRowId = (row: any, index: number) => {
          if (metadata?.primary_keys?.length) {
            return metadata.primary_keys
              .map((pk: string) => String(row[pk]))
              .join('::')
          }
          const offset = state.pagination
            ? state.pagination.pageIndex * state.pagination.pageSize
            : 0
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
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount,
    rowCount: totalCount,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(state.pagination) : updater
      onPaginationChange?.(newPagination)
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
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
        <div className="flex-1 flex flex-col overflow-hidden border *:data-[slot=table-container]:h-full *:data-[slot=table-container]:overflow-auto!">
          {table.getRowModel().rows.length === 0 ? (
            <>
              <div className="flex items-center w-auto">
                <Table className="w-auto">
                  <DataTableHeader table={table} />
                </Table>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">
                  No results found
                </div>
              </div>
            </>
          ) : (
            <Table className="w-auto">
              <DataTableHeader table={table} />

              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    className={`border-b ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${enableRowSelection && row.getIsSelected()
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
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
          />
        </div>
      </div>
    </div>
  )
}
