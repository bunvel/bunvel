import { DataTable } from '@/components/data-table/data-table'

interface TableViewerProps {
  table: string
  columns: string[]
  data: Record<string, any>[]
  isLoading: boolean
  onPageChange: (page: number) => void
  currentPage: number
  onPageSizeChange: (size: number) => void
  pageSize: number
}

export const TableViewer = ({
  table,
  columns,
  data,
  isLoading,
  onPageChange,
  currentPage,
  onPageSizeChange,
  pageSize,
}: TableViewerProps) => {
  if (!table) {
    return (
      <div className="bg-card flex items-center justify-center h-full text-muted-foreground">
        Select a table to view its data
      </div>
    )
  }

  const tableColumns = columns.map((column) => ({
    key: column,
    header: column,
    cell: (row: Record<string, any>) => {
      const value = row[column]
      return (
        <span className="font-mono text-sm">
          {typeof value === 'object' ? JSON.stringify(value) : String(value ?? 'NULL')}
        </span>
      )
    },
  }))

  const pageSizeOptions = [
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
    { value: Number.MAX_SAFE_INTEGER, label: 'No limit' },
  ]

  return (
    <DataTable
      columns={tableColumns}
      data={data}
      isLoading={isLoading}
      currentPage={currentPage}
      onPageChange={onPageChange}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      totalItems={data.length}
      pageSizeOptions={pageSizeOptions}
      emptyMessage="No data available"
      loadingMessage="Loading table data..."
      className="h-full"
    />
  )
}

export default TableViewer