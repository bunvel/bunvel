import { DataTable } from '@/components/data-table/data-table'
import { useTableData, useTableMetadata } from '@/hooks/queries/useTableData'
import { DEFAULT_PAGE_SIZE } from '@/utils/constant'
import { useSearch } from '@tanstack/react-router'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { TableToolbar } from './table-toolbar'

interface SearchParams {
  schema?: string
  table?: string
  [key: string]: unknown
}

// Move these interfaces to a separate types file if used elsewhere
export interface Table extends Record<string, any> {
  [key: string]: any // Consider replacing with more specific types
}

export interface TableMetadata {
  columns: Array<{
    column_name: string
    data_type: string
    is_primary_key: boolean
    is_foreign_key: boolean
  }>
  primary_keys: string[]
}

export function TableViewer() {
  const search = useSearch({ strict: false }) as SearchParams
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedRows, setSelectedRows] = useState<Table[]>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  // Get table metadata for columns
  const { data: metadata, isLoading: isMetadataLoading } = useTableMetadata(
    search.schema,
    search.table,
  )

  // Get table data with pagination, sorting, and filtering
  const {
    data: tableData,
    isLoading: isTableDataLoading,
    error,
  } = useTableData(search.schema, search.table, {
    page: pagination.pageIndex + 1, // +1 because backend is 1-indexed
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
    filters: columnFilters.reduce(
      (acc, filter) => {
        acc[filter.id] = filter.value
        return acc
      },
      {} as Record<string, unknown>,
    ),
    primaryKeys: metadata?.primary_keys || [],
  })

  const isLoading = isMetadataLoading || isTableDataLoading

  // Generate columns from metadata
  type TableData = Record<string, any>

  const columns = useMemo<ColumnDef<TableData>[]>(() => {
    if (!metadata?.columns) {
      return []
    }

    return metadata.columns.map((column: any) => ({
      id: column.column_name,
      header: column.column_name,
      accessorKey: column.column_name,
      cell: (info: any) => {
        const value = info.getValue()
        return value === null || value === undefined ? 'NULL' : String(value)
      },
      meta: {
        dataType: column.data_type,
        isPrimaryKey: column.is_primary_key,
        isForeignKey: column.is_foreign_key,
      },
    }))
  }, [metadata])

  // Show message when no table is selected
  if (!search.table) {
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
    <div className="h-full flex flex-col">
      <TableToolbar
        selectedRows={selectedRows}
        schema={search.schema}
        table={search.table}
      />

      <div className="flex-1 overflow-auto">
        <DataTable
          columns={columns}
          data={tableData?.data || []}
          isLoading={isLoading}
          error={error}
          enableRowSelection={true}
          onRowSelectionChange={setSelectedRows}
          onSortingChange={setSorting}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          pageCount={tableData?.totalPages || 0}
          state={{
            pagination,
            sorting,
            columnFilters,
            rowSelection: {},
          }}
        />
      </div>
    </div>
  )
}
