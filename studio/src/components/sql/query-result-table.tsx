import { DataTable } from '@/components/data-table/data-table'
import { Spinner } from '@/components/ui/spinner'
import { useSqlManager } from '@/hooks/use-sql-manager'
import type { TableMetadata } from '@/types/table'
import { Alert, Check, Info } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

export function QueryResultTable() {
  const { activeTab } = useSqlManager()
  const lastExecutedQuery = activeTab?.lastExecutedQuery || ''
  const queryResult = activeTab?.result
  const error = activeTab?.error
  const isExecuting = activeTab?.isExecuting || false

  // Generate columns dynamically from the query result
  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
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
    pageSize: Number.MAX_SAFE_INTEGER,
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
    />
  )
}
