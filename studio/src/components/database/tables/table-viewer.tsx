import { DataTable } from '@/components/data-table/data-table'
import { DataTableCell } from '@/components/data-table/data-table-cell'
import { DataTableHeaderCell } from '@/components/data-table/data-table-header-cell'
import { useTableManager } from '@/hooks/use-table-manager'
import { isRestrictedSchema } from '@/lib/restricated-schema'
import type { TableRow } from '@/types/table'
import { formatCellValue } from '@/utils/format'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { TableIcon } from '@hugeicons/core-free-icons'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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

  const isRestricted = isRestrictedSchema(schema)

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
    : isRestricted
      ? [
          ...metadata.columns.map((column: any) => ({
            id: column.column_name,
            header: ({ column: tanstackColumn }: any) => (
              <DataTableHeaderCell
                column={column}
                tanstackColumn={tanstackColumn}
                className="p-2 cursor-pointer select-none"
              />
            ),
            accessorKey: column.column_name,
            cell: (info: any) => {
              return (
                <DataTableCell
                  value={formatCellValue(info.getValue(), column.data_type)}
                  rawValue={info.getValue()}
                  isForeignKey={column.is_foreign_key}
                  columnMetadata={column}
                />
              )
            },
            meta: {
              dataType: column.data_type,
            },
          })),
        ]
      : [
          ...metadata.columns.map((column: any) => ({
            id: column.column_name,
            header: ({ column: tanstackColumn }: any) => (
              <DataTableHeaderCell
                column={column}
                tanstackColumn={tanstackColumn}
                className="p-2 cursor-pointer select-none"
              />
            ),
            accessorKey: column.column_name,
            cell: (info: any) => {
              return (
                <DataTableCell
                  value={formatCellValue(info.getValue(), column.data_type)}
                  rawValue={info.getValue()}
                  isForeignKey={column.is_foreign_key}
                  columnMetadata={column}
                />
              )
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
      <Empty className="h-full rounded-none border-0 bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={TableIcon} />
          </EmptyMedia>
          <EmptyTitle>No Table Selected</EmptyTitle>
          <EmptyDescription>Please select a table to explore its data</EmptyDescription>
        </EmptyHeader>
      </Empty>
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
          totalCount={tableData?.total || 0}
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
