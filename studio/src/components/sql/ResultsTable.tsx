import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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

  const pageSizes = [
    { value: null, label: 'No limit' },
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1000' },
  ]

  const totalPages = useMemo(() => {
    return pageSize ? Math.ceil(results.length / pageSize) : 1
  }, [results.length, pageSize])

  const startIndex = useMemo(() => {
    return pageSize ? (currentPage - 1) * pageSize : 0
  }, [currentPage, pageSize])

  const paginatedResults = useMemo(() => {
    return pageSize ? results.slice(startIndex, startIndex + pageSize) : results
  }, [results, startIndex, pageSize])

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }
  if (isLoading) {
    return (
      <div className="bg-card flex items-center justify-center h-full text-muted-foreground">
        Executing query...
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <div className="bg-card flex items-center justify-center h-full text-muted-foreground">
        Run a query to see results
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <Table className="w-full border border-border">
            <TableHeader className="bg-sidebar-accent/50">
              <TableRow className="border-b border-border">
                {columns.map((col, index) => (
                  <TableHead
                    key={index}
                    className="border-r border-border last:border-r-0 text-foreground font-medium"
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-b border-border last:border-b-0"
                >
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="font-mono text-sm border-r border-border last:border-r-0 text-muted-foreground"
                    >
                      {typeof row[col] === 'object'
                        ? JSON.stringify(row[col])
                        : String(row[col] ?? 'NULL')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      {results.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">Rows per page:</div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    {pageSize ? pageSize : 'No limit'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {pageSizes.map((size) => (
                  <DropdownMenuItem
                    key={size.label}
                    onClick={() => {
                      setPageSize(size.value)
                      setCurrentPage(1)
                    }}
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-muted-foreground">
              {pageSize
                ? `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, results.length)} of ${results.length} rows`
                : `Showing all ${results.length} rows`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1 || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages || isLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsTable
