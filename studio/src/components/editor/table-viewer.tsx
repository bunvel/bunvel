import { DataTable } from '@/components/data-table/data-table'
import { useTableData, useTableMetadata } from '@/hooks/queries/useTableData'
import { useTables } from '@/hooks/queries/useTables'
import { useTableStore } from '@/stores/table-store'
import { SchemaTable, TableKind } from '@/types'
import { FilterConfig } from '@/types/table'
import { DEFAULT_PAGE_SIZE } from '@/utils/constant'
import { formatCellValue } from '@/utils/format'
import { useSearch } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo } from 'react'
import { CommonTableHeader } from '../common/common-table-header'
import { TableToolbar } from './table-toolbar'

type TableRow = Record<string, unknown>

export function TableViewer() {
  const { schema, table } = useSearch({ strict: false }) as SchemaTable

  // Zustand store hooks
  const setTableState = useTableStore((state) => state.setTableState)
  const setSelectedRows = useTableStore((state) => state.setSelectedRows)
  const setRowSelection = useTableStore((state) => state.setRowSelection)
  const setPagination = useTableStore((state) => state.setPagination)
  const setSorts = useTableStore((state) => state.setSorts)
  const setFilters = useTableStore((state) => state.setFilters)

  // Get current table key
  const currentTableKey = useMemo(() => {
    return schema && table ? `${schema}.${table}` : null
  }, [schema, table])

  // Get current table state with proper subscription
  const tableState = useTableStore((state) =>
    currentTableKey ? state.tableStates[currentTableKey] : null,
  )

  // Initialize table state for new tables
  useEffect(() => {
    if (currentTableKey) {
      // This will create the table state if it doesn't exist
      setTableState(currentTableKey, {})
    }
  }, [currentTableKey, setTableState])

  const handleRowSelectionChange = useCallback(
    (newSelectedRows: TableRow[]) => {
      if (currentTableKey) {
        setSelectedRows(currentTableKey, newSelectedRows)
      }
    },
    [currentTableKey, setSelectedRows],
  )

  const handleRowSelectionStateChange = useCallback(
    (
      updaterOrValue:
        | Record<string, boolean>
        | ((old: Record<string, boolean>) => Record<string, boolean>),
    ) => {
      if (currentTableKey) {
        const currentRowSelection = tableState?.rowSelection || {}
        const newRowSelection =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(currentRowSelection)
            : updaterOrValue
        setRowSelection(currentTableKey, newRowSelection)
      }
    },
    [currentTableKey, tableState?.rowSelection, setRowSelection],
  )

  const handleSortChange = useCallback(
    (newSorts: Array<{ column: string; direction: 'asc' | 'desc' }>) => {
      if (currentTableKey) {
        setSorts(currentTableKey, newSorts)
        // Reset to first page when sort changes
        const currentPagination = tableState?.pagination || {
          pageIndex: 0,
          pageSize: DEFAULT_PAGE_SIZE,
        }
        setPagination(currentTableKey, {
          ...currentPagination,
          pageIndex: 0,
        })
      }
    },
    [currentTableKey, tableState?.pagination, setSorts, setPagination],
  )

  const handleFilterChange = useCallback(
    (newFilters: FilterConfig[]) => {
      if (currentTableKey) {
        setFilters(currentTableKey, newFilters)
        // Reset to first page when filters change
        const currentPagination = tableState?.pagination || {
          pageIndex: 0,
          pageSize: DEFAULT_PAGE_SIZE,
        }
        setPagination(currentTableKey, {
          ...currentPagination,
          pageIndex: 0,
        })
      }
    },
    [currentTableKey, tableState?.pagination, setFilters, setPagination],
  )

  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      if (currentTableKey) {
        setPagination(currentTableKey, newPagination)
      }
    },
    [currentTableKey, setPagination],
  )

  // Get table metadata for columns
  const { data: metadata, isLoading: isMetadataLoading } = useTableMetadata(
    schema,
    table,
  )

  // Get table data with pagination, sorting, and filtering
  const {
    data: tableData,
    isLoading: isTableDataLoading,
    error,
  } = useTableData(schema, table, {
    page: (tableState?.pagination.pageIndex ?? 0) + 1, // +1 because backend is 1-indexed
    pageSize: tableState?.pagination.pageSize ?? DEFAULT_PAGE_SIZE,
    primaryKeys: metadata?.primary_keys || [],
    sorts: tableState?.sorts,
    filters:
      tableState?.filters && tableState.filters.length > 0
        ? tableState.filters
        : undefined,
  })

  const { data: tables } = useTables()

  const kind: TableKind | undefined = tables?.find(
    (t) => t.name === table,
  )?.kind

  const isLoading = isMetadataLoading || isTableDataLoading

  // Create a function to clear selection for the current table
  const handleSelectionClear = useCallback(() => {
    if (currentTableKey) {
      setSelectedRows(currentTableKey, [])
      setRowSelection(currentTableKey, {})
    }
  }, [currentTableKey, setSelectedRows, setRowSelection])

  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    if (!metadata?.columns) return []

    return metadata.columns.map((column) => ({
      id: column.column_name,
      header: () => <CommonTableHeader column={column} className="p-2" />,
      accessorKey: column.column_name,
      cell: (info) => {
        return formatCellValue(info.getValue())
      },
      meta: {
        dataType: column.data_type,
      },
    }))
  }, [metadata])

  // Show message when no table is selected
  if (!schema || !table) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-card">
        <div className="text-center p-8">
          <div className="text-2xl font-medium mb-2">No Table Selected</div>
          <p className="text-sm">Please select a table to explore its data</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <TableToolbar
        selectedRows={tableState?.selectedRows || []}
        schema={schema}
        table={table}
        kind={kind}
        primaryKeys={metadata?.primary_keys || []}
        sorts={tableState?.sorts || []}
        onSortChange={handleSortChange}
        filters={tableState?.filters || []}
        onFilterChange={handleFilterChange}
        onSelectionClear={handleSelectionClear}
      />

      <div className="flex-1 overflow-auto">
        <DataTable
          columns={columns}
          data={tableData?.data || []}
          metadata={
            metadata || {
              columns: [],
              primary_keys: [],
              foreign_keys: [],
              table_type: 'r',
            }
          }
          isLoading={isLoading}
          error={error}
          enableRowSelection={true}
          onRowSelectionChange={handleRowSelectionChange}
          onRowSelectionStateChange={handleRowSelectionStateChange}
          onPaginationChange={handlePaginationChange}
          pageCount={tableData?.totalPages || 0}
          state={{
            pagination: tableState?.pagination || {
              pageIndex: 0,
              pageSize: DEFAULT_PAGE_SIZE,
            },
            rowSelection: tableState?.rowSelection || {},
          }}
        />
      </div>
    </>
  )
}
