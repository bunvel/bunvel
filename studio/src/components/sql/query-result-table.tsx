import { ColumnDef, Row } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '../data-table/data-table'

export interface QueryResult<T = any> {
  data: T[]
  columns: string[]
  rowCount: number
  executionTime?: number
}

interface QueryResultTableProps {
  result?: QueryResult | null
  isExecuting: boolean
  error: Error | null
}

export function QueryResultTable({
  result,
  isExecuting,
  error,
}: QueryResultTableProps) {
  // Generate columns dynamically from the query result
  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (!result?.columns) return []

    return result.columns.map((column) => ({
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
  }, [result?.columns])

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
  const displayData = useMemo(() => result?.data || [], [result?.data])

  return (
    <DataTable
      data={displayData}
      columns={columns}
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
