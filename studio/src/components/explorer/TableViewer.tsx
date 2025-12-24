import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { InsertRowForm } from './InsertRowForm'

interface TableViewerProps {
  table: string
  schema?: string
  columns: string[]
  columnTypes?: Record<string, string>
  data: { [key: string]: any }[]
  isLoading: boolean
  onPageChange: (page: number) => void
  currentPage: number
  onPageSizeChange: (size: number) => void
  pageSize: number
  onInsert?: (data: Record<string, any>) => Promise<void>
}

export const TableViewer = ({
  table,
  schema = 'public',
  columns,
  columnTypes = {},
  data,
  isLoading,
  onPageChange,
  currentPage,
  onPageSizeChange,
  pageSize,
  onInsert,
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
    dataType: columnTypes[column], // Add data type
    cell: (row: Record<string, any>) => {
      const value = row[column]
      return (
        <span className="font-mono text-sm">
          {typeof value === 'object'
            ? JSON.stringify(value)
            : String(value ?? 'NULL')}
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
    <div className="flex flex-col h-full">
      <div className="bg-card flex items-center gap-2 p-2 border-b">
        {onInsert && table && schema !== 'auth' && (
          <InsertRowForm
            tab={{
              id: `${schema}.${table}`,
              schema,
              table,
              columns,
              columnTypes,
              data: [],
              isLoading: false,
              page: 1,
              totalRows: 0,
            }}
            onInsert={onInsert}
          >
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              Insert
            </Button>
          </InsertRowForm>
        )}
        {schema === 'auth' && (
          <div className="text-sm text-muted-foreground px-2">
            Read-only mode: auth schema is protected
          </div>
        )}
      </div>
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
        className="h-[calc(100%-40px)]"
      />
    </div>
  )
}

export default TableViewer
