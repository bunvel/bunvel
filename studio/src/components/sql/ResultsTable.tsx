import { DataTable } from '@/components/data-table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

interface ResultsTableProps {
  columns: string[]
  results: Record<string, any>[]
  isLoading: boolean
}

export const ResultsTable = ({
  columns,
  results,
  isLoading,
}: ResultsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | null>(50)

  const columnHelper = createColumnHelper<Record<string, any>>()

  const tableColumns = useMemo(() => {
    return columns.map((column) =>
      columnHelper.accessor(column, {
        id: column,
        header: column,
        cell: (info) => {
          const value = info.getValue()
          return (
            <div className="truncate max-w-[300px]">
              <span className="font-mono text-sm">
                {typeof value === 'object' ? JSON.stringify(value) : String(value ?? 'NULL')}
              </span>
            </div>
          )
        },
        meta: {
          key: column,
          className: 'min-w-[100px] max-w-[300px]',
        },
      })
    )
  }, [columns, columnHelper])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size === Number.MAX_SAFE_INTEGER ? null : size)
    setCurrentPage(1)
  }

  return (
    <div className="h-full">
      <DataTable
        columns={tableColumns}
        data={results}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        onPageSizeChange={handlePageSizeChange}
        pageSize={pageSize ?? Number.MAX_SAFE_INTEGER}
        totalItems={results.length}
        emptyMessage="No results"
        loadingMessage="Loading results..."
        showPagination={true}
      />
    </div>
  )
}

export default ResultsTable