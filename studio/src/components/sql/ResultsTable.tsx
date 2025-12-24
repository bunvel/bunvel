import { DataTable } from '@/components/data-table/data-table'
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
  const [pageSize, setPageSize] = useState<number | null>(100)

  const pageSizeOptions = [
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
    { value: Number.MAX_SAFE_INTEGER, label: 'No limit' },
  ]

  const tableColumns = useMemo(() => {
    return columns.map((column) => ({
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
  }, [columns])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size === Number.MAX_SAFE_INTEGER ? null : size)
    setCurrentPage(1)
  }

  return (
    <DataTable
      columns={tableColumns}
      data={results}
      isLoading={isLoading}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      pageSize={pageSize || Number.MAX_SAFE_INTEGER}
      onPageSizeChange={handlePageSizeChange}
      totalItems={results.length}
      pageSizeOptions={pageSizeOptions}
      emptyMessage="No results to display"
      loadingMessage="Loading results..."
      className="h-full"
    />
  )
}

export default ResultsTable