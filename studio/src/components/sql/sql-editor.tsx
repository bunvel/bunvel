import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { ColumnDef } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '../data-table/data-table'
import { SqlQueryForm } from './sql-query-form'

export interface QueryResult<T = any> {
  data: T[]
  columns: string[]
  rowCount: number
  executionTime?: number
}

export function SqlEditor() {
  const [query, setQuery] = useState('')
  const {
    mutate: executeQuery,
    data: queryResult,
    error,
    isPending: isExecuting,
  } = useExecuteSqlQuery()

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
  }

  const handleExecute = () => {
    if (!query.trim()) return
    executeQuery(query)
  }
  // Generate columns dynamically from the query result
  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (!queryResult?.columns) return []

    return queryResult.columns.map((column: string) => ({
      accessorKey: column,
      header: column,
      cell: ({ row }) => {
        const value = row.getValue(column)
        return (
          <div className="text-sm">
            {value !== null ? String(value) : 'NULL'}
          </div>
        )
      },
    }))
  }, [queryResult?.columns])

  // Default columns when there's no result yet
  const displayColumns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (queryResult?.columns) return columns

    // Return a single column with a message when there are no results
    return [
      {
        accessorKey: 'message',
        header: 'Result',
        cell: () => (
          <div className="flex items-center border justify-center h-full text-muted-foreground py-8">
            Run a query to see results
          </div>
        ),
      },
    ]
  }, [columns, queryResult?.columns])

  // Table state with required properties
  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: Number.MAX_SAFE_INTEGER },
    sorting: [] as any[],
    columnFilters: [] as any[],
    rowSelection: {} as Record<string, boolean>,
  })

  // Handlers with proper typing
  const handlePaginationChange = useCallback(
    (pagination: { pageIndex: number; pageSize: number }) => {
      setTableState((prev) => ({
        ...prev,
        pagination,
      }))
    },
    [],
  )

  const handleRowSelectionChange = useCallback((selectedRows: any[]) => {
    // Convert selected rows to row selection state
    const newRowSelection = selectedRows.reduce<Record<string, boolean>>(
      (acc, index) => {
        acc[index] = true
        return acc
      },
      {},
    )

    // Only update state if the selection actually changed
    setTableState((prev) => {
      const currentSelection = Object.keys(prev.rowSelection)
        .filter((key) => prev.rowSelection[key])
        .sort()
        .join(',')

      const newSelection = Object.keys(newRowSelection).sort().join(',')

      // If the selection hasn't changed, return previous state to prevent re-render
      if (currentSelection === newSelection) {
        return prev
      }

      return {
        ...prev,
        rowSelection: newRowSelection,
      }
    })
  }, [])

  // Use query result data directly, empty states are handled in JSX
  const displayData = useMemo(
    () => queryResult?.data || [],
    [queryResult?.data],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="h-[350px] border-b overflow-y-auto">
        <SqlQueryForm
          query={query}
          onQueryChange={handleQueryChange}
          onExecute={handleExecute}
          isExecuting={isExecuting}
        />
      </div>

      <div className="flex-1 min-h-0">
        {!queryResult?.data ? (
          <div className="bg-card h-full px-4 py-5 text-muted-foreground text-sm">
            Run a query to see results
          </div>
        ) : queryResult.data.length === 0 ? (
          <div className="bg-card h-full px-4 py-5 text-muted-foreground text-sm">
            No results found
          </div>
        ) : (
          <DataTable
            data={displayData}
            columns={displayColumns}
            isLoading={isExecuting}
            error={error}
            state={{
              ...tableState,
              // Convert rowSelection to array of selected row indices
              rowSelection: Object.entries(tableState.rowSelection)
                .filter(([_, selected]) => selected)
                .reduce(
                  (acc, [index]) => ({
                    ...acc,
                    [index]: true,
                  }),
                  {},
                ),
            }}
            onPaginationChange={handlePaginationChange}
            onRowSelectionChange={handleRowSelectionChange}
            pageCount={Math.ceil(
              displayData.length / tableState.pagination.pageSize,
            )}
          />
        )}
      </div>
    </div>
  )
}
