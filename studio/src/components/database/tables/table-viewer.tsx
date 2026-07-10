import { DataTable } from '@/components/data-table/data-table'
import { DataTableHeaderCell } from '@/components/data-table/data-table-header-cell'
import { useTableManager } from '@/hooks/use-table-manager'
import type { TableRow } from '@/types/table'
import { formatCellValue } from '@/utils/format'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { NewColumnForm } from '../columns/new-column-form'
import { TableToolbar } from './table-toolbar'

export function TableViewer() {
  const {
    schema,
    table,
    metadata,
    tableData,
    isLoading,
    error,
    rowSelection,
    pagination,
    sorts,
    handleRowSelectionChange,
    handleRowSelectionStateChange,
    handlePaginationChange,
    handleSortChange,
  } = useTableManager()

  const sorting = useMemo(() => {
    return sorts.map((s) => ({
      id: s.column,
      desc: s.direction === 'desc',
    }))
  }, [sorts])

  const handleSortingChange = (newSorting: any) => {
    const mappedSorts = newSorting.map((s: any) => ({
      column: s.id,
      direction: s.desc ? 'desc' : 'asc',
    }))
    handleSortChange(mappedSorts)
  }

  const columns: Array<ColumnDef<TableRow>> = !metadata?.columns
    ? []
    : [
        ...metadata.columns.map((column: any) => ({
          id: column.column_name,
          header: () => (
            <DataTableHeaderCell
              column={column}
              className="p-2 cursor-pointer select-none"
              sorts={sorts}
              onSortChange={handleSortChange}
            />
          ),
          accessorKey: column.column_name,
          cell: (info: any) => {
            return formatCellValue(info.getValue(), column.data_type)
          },
          meta: {
            dataType: column.data_type,
          },
        })),
        {
          id: 'empty-column',
          header: () => <NewColumnForm schema={schema!} table={table!} />,
          accessorKey: 'empty-column',
          cell: () => {
            return <div className="p-2"></div>
          },
          meta: {
            dataType: 'text',
          },
          size: 100,
        },
      ]

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
      <TableToolbar />

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
          onSortingChange={handleSortingChange}
          pageCount={tableData?.totalPages || 0}
          state={{
            pagination,
            rowSelection,
            sorting,
          }}
        />
      </div>
    </>
  )
}
