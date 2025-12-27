import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Filter, Plus, RefreshCcw, SortAsc, Trash, X } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  onRefresh?: () => Promise<void>
  onFilter?: () => Promise<void>
  onSort?: () => Promise<void>
  onDelete?: (ids: string[]) => Promise<void>
  onCopy?: (rows: Record<string, any>[]) => Promise<void>
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
  onRefresh,
  onFilter,
  onSort,
  onDelete,
  onCopy,
}: TableViewerProps) => {
  if (!table) {
    return (
      <div className="bg-card flex items-center justify-center h-full text-muted-foreground">
        Select a table to view its data
      </div>
    )
  }

  const getDataType = (column: string) => {
    switch (columnTypes[column]) {
      case "timestamp without time zone":
        return "timestamptz"
      default:
        return "text"
    }
  }

  const tableColumns = columns.map((column) => ({
    id: column,
    header: () => (
      <div className="flex gap-1 items-center">
        <span>{column}</span>
        <span className="text-xs text-muted-foreground">
          {getDataType(column) || 'unknown'}
        </span>
      </div>
    ),
    meta: {
      key: column,
      className: 'min-w-[120px] max-w-[300px] truncate',
    },
    cell: ({ row }: { row: { original: Record<string, any> } }) => {
      const value = row.original[column];
      return (
        <div className="truncate max-w-full">
          {typeof value === 'object'
            ? JSON.stringify(value)
            : String(value ?? 'NULL')}
        </div>
      )
    },
  }))

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const hasSelectedRows = Object.keys(rowSelection).length > 0
  const selectedRows = data.filter((_, index) => rowSelection[index])
  const rowSelectionCount = Object.keys(rowSelection).length

  // Update row selection when data changes
  useEffect(() => {
    // Clear selection when data changes to prevent stale references
    setRowSelection({})
  }, [data])

  const handleDelete = async () => {
    if (!onDelete || !selectedRows.length) return
    const ids = selectedRows.map((row) => row.id).filter(Boolean)
    if (ids.length) {
      await onDelete(ids)
      setRowSelection({})
    }
  }

  const handleCopy = async () => {
    if (!onCopy || !selectedRows.length) return
    await onCopy(selectedRows)
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
      setRowSelection({})
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card flex items-center justify-between px-4 py-2 border-b">
        {hasSelectedRows && selectedRows.length > 0 ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {rowSelectionCount} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowSelection({})
                }}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                <span>Clear</span>
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={!selectedRows.some((row) => row.id)}
              >
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button disabled={schema === 'auth'} variant="default" size="sm" onClick={() => onInsert?.({})}>
              <Plus className="h-4 w-4 mr-1" />
              Insert
            </Button>
            <div className="h-4 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <div className="h-4 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onFilter}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <div className="h-4 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onSort}
              className="flex items-center gap-1"
            >
              <SortAsc className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </div>
        )}
      </div>
      <DataTable
        columns={[
          {
            id: 'select',
            meta: { key: 'select', className: 'min-w-[60px] max-w-[60px]' },
            header: ({ table }) => (
              <div className="flex items-center justify-center w-full h-full">
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                  }
                  aria-label="Select all"
                  className="h-4 w-4 border-2 border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center justify-center w-full h-full">
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                  className="h-4 w-4 border-2 border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            ),
          },
          ...tableColumns,
        ]}
        data={data}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        totalItems={data.length}
        emptyMessage="No data available"
        loadingMessage="Loading table data..."
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}

export default TableViewer
