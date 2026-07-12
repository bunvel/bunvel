import { Alert, Check, Info } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import { QueryChart } from './query-chart'
import { Spinner } from '@/components/ui/spinner'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { TableMetadata } from '@/types/table'

const TableIconSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-3.5 mr-1.5"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
)

const ChartIconSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-3.5 mr-1.5"
  >
    <line x1="18" x2="18" y1="20" y2="10" />
    <line x1="12" x2="12" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="14" />
  </svg>
)

export function QueryResultTable() {
  const { activeTab } = useSqlManager()
  const lastExecutedQuery = activeTab?.lastExecutedQuery || ''
  const queryResult = activeTab?.result
  const error = activeTab?.error
  const isExecuting = activeTab?.isExecuting || false
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')

  // Generate columns dynamically from the query result
  const columns = useMemo<Array<ColumnDef<Record<string, any>>>>(() => {
    if (!queryResult?.columns) return []

    return queryResult.columns.map((column: string) => ({
      accessorKey: column,
      header: column,
      cell: ({ row }: { row: Row<Record<string, any>> }) => {
        const value = row.getValue(column)
        return (
          <div className="text-sm">
            {value !== null ? String(value) : 'NULL'}
          </div>
        )
      },
    }))
  }, [queryResult?.columns])

  // Table state with pagination only
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  })

  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPagination(newPagination)
    },
    [],
  )

  // Use query result data directly, empty states are handled in JSX
  const displayData = useMemo(
    () => queryResult?.data || [],
    [queryResult?.data],
  )

  // Create minimal metadata for query results (no foreign keys or detailed column info)
  const metadata: TableMetadata = useMemo(
    () => ({
      columns: [],
      primary_keys: [],
      foreign_keys: [],
      table_type: 'r',
    }),
    [],
  )

  // Handle different states
  if (!lastExecutedQuery?.trim()) {
    return (
      <div className="flex items-center p-4 text-sm text-muted-foreground bg-secondary">
        <HugeiconsIcon icon={Info} className="h-4 w-4 mr-1" />
        Enter your SQL query and click
        <span className="font-medium"> Run</span> to execute it
      </div>
    )
  }

  if (isExecuting) {
    return (
      <div className="flex items-center gap-2 p-4 text-muted-foreground bg-secondary">
        <Spinner />
        <span>Executing query...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center p-4 text-destructive bg-destructive/10">
        <HugeiconsIcon icon={Alert} className="h-4 w-4 mr-1" />
        <span className="font-medium">Error:</span>
        <span className="ml-2 text-sm">
          {error.message || 'Unknown error occurred'}
        </span>
      </div>
    )
  }

  if (!queryResult?.data || queryResult.data.length === 0) {
    return (
      <div className="flex items-center p-4 text-sm text-muted-foreground bg-secondary gap-2">
        <HugeiconsIcon icon={Check} className="h-4 w-4" />
        <span className="font-medium">Success. No rows returned</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* View Mode Toggle Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>{displayData.length} row(s) returned</span>
          {queryResult?.executionTime !== undefined && (
            <>
              <span>•</span>
              <span>{queryResult.executionTime.toFixed(1)} ms</span>
            </>
          )}
        </div>
        <div className="flex bg-muted p-0.5 rounded-lg border shrink-0">
          <Button
            size="xs"
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('table')}
            className="text-xs"
          >
            <TableIconSvg />
            Table
          </Button>
          <Button
            size="xs"
            variant={viewMode === 'chart' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('chart')}
            className="text-xs"
          >
            <ChartIconSvg />
            Chart
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {viewMode === 'table' ? (
          <DataTable
            data={displayData}
            columns={columns}
            metadata={metadata}
            isLoading={isExecuting}
            error={error}
            state={{
              pagination,
              sorting: [],
              columnFilters: [],
              rowSelection: {},
            }}
            onPaginationChange={handlePaginationChange}
            pageCount={Math.ceil(displayData.length / pagination.pageSize)}
            manualPagination={false}
          />
        ) : (
          <div className="h-full p-4 overflow-y-auto bg-card">
            <QueryChart data={displayData} />
          </div>
        )}
      </div>
    </div>
  )
}
