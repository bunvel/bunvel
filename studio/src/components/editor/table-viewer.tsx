import { DataTable } from '@/components/data-table/data-table'
import { useTableData, useTableMetadata } from '@/hooks/queries/useTableData'
import { DEFAULT_PAGE_SIZE } from '@/utils/constant'
import {
  formatCellValue,
  formatDataType,
  getSortedColumns,
} from '@/utils/format'
import { Key01Icon, Link02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSearch } from '@tanstack/react-router'
import {
  ColumnDef
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { TableTabs } from './table-tabs'
import { TableToolbar } from './table-toolbar'

interface SearchParams {
  schema?: string
  table?: string
}

type TableRow = Record<string, unknown>


export function TableViewer() {
  const { schema, table } = useSearch({ strict: false }) as SearchParams
  const [selectedRows, setSelectedRows] = useState<TableRow[]>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

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
    page: pagination.pageIndex + 1, // +1 because backend is 1-indexed
    pageSize: pagination.pageSize,
    primaryKeys: metadata?.primary_keys || [],
  })

  const isLoading = isMetadataLoading || isTableDataLoading

  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    if (!metadata?.columns) return []

    return getSortedColumns(metadata.columns).map((column) => ({
      id: column.column_name,
      header: () => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 group">
            <span>{column.column_name}</span>
            <div className="flex items-center gap-1">
              {column.is_primary_key && (
                <HugeiconsIcon
                  icon={Key01Icon}
                  className="h-3.5 w-3.5 text-amber-500"
                />
              )}
              {column.is_foreign_key && (
                <HugeiconsIcon
                  icon={Link02Icon}
                  className="h-3.5 w-3.5 text-blue-500"
                />
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            {formatDataType(column.data_type)}
          </span>
        </div>
      ),
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
    <div className="h-full flex flex-col">
      <TableTabs />

      <TableToolbar selectedRows={selectedRows} schema={schema} table={table} kind={metadata?.table_type || 'r'} />

      <div className="flex-1 overflow-auto">
        <DataTable
          columns={columns}
          data={tableData?.data || []}
          isLoading={isLoading}
          error={error}
          enableRowSelection={true}
          onRowSelectionChange={setSelectedRows}
          onPaginationChange={setPagination}
          pageCount={tableData?.totalPages || 0}
          state={{
            pagination,
            rowSelection: {},
          }}
        />
      </div>
    </div>
  )
}
