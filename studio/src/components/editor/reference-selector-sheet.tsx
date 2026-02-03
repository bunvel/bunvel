import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTableData, useTableMetadata } from '@/hooks/queries/useTableData'
import type { FilterConfig, SortConfig } from '@/types/table'
import { DEFAULT_PAGE_SIZE } from '@/utils/constant'
import { formatCellValue } from '@/utils/format'
import { ArrowLeft, ArrowRight } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { DataTableHeaderCell } from '@/components/data-table/data-table-header-cell'
import { FilterButton } from './toolbar-buttons/filter-button'
import { SortButton } from './toolbar-buttons/sort-button'

interface ReferenceSelectorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  foreignKeyColumn: any
  onRecordSelect: (record: any) => void
}

export function ReferenceSelectorSheet({
  foreignKeyColumn,
  open,
  onOpenChange,
  onRecordSelect,
}: ReferenceSelectorSheetProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterConfig[]>([])
  const [sorts, setSorts] = useState<SortConfig[]>([])

  const handleFilterChange = (newFilters: FilterConfig[]) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (newSorts: SortConfig[]) => {
    setSorts(newSorts)
    setCurrentPage(1) // Reset to first page when sort changes
  }

  const schema = foreignKeyColumn?.foreign_table_schema
  const table = foreignKeyColumn?.foreign_table_name

  // Reset state when foreign key column changes
  useEffect(() => {
    setCurrentPage(1)
    setFilters([])
    setSorts([])
  }, [foreignKeyColumn])

  // Get table metadata
  const { data: metadata, isLoading: isMetadataLoading } = useTableMetadata(
    schema,
    table,
  )

  // Get table data with pagination, sorting, and filtering
  const {
    data: tableData,
    isLoading: isTableDataLoading,
    error,
  } = useTableData(schema, table, {
    page: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
    primaryKeys: metadata?.primary_keys || [],
    sorts: sorts.length > 0 ? sorts : undefined,
    filters: filters.length > 0 ? filters : undefined,
  })

  const isLoading = isMetadataLoading || isTableDataLoading

  // Handle record selection - directly select and close on row click
  const handleRecordClick = (record: any) => {
    onRecordSelect(record)
    onOpenChange(false)
  }

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (tableData && currentPage < tableData.totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Filter and Sort UI
  const renderFilterUI = () => (
    <div className="flex items-center gap-2 p-2 border-b">
      <FilterButton
        schema={schema}
        table={table}
        filters={filters}
        onFilterChange={handleFilterChange}
        recordCount={tableData?.data?.length || 0}
      />
      <SortButton
        schema={schema}
        table={table}
        sorts={sorts}
        onSortChange={handleSortChange}
        recordCount={tableData?.data?.length || 0}
      />
    </div>
  )

  if (!schema || !table) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-card min-w-4xl flex flex-col overflow-visible"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle>
            Select a record from {schema}.{table}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Filter and Sort UI */}
          {renderFilterUI()}

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-red-500">Error loading data</div>
              </div>
            ) : !tableData?.data || tableData.data.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">
                  No records found
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell className="font-medium text-sm p-2 border">
                      Select
                    </TableCell>
                    {metadata?.columns?.map((column) => (
                      <TableCell
                        key={column.column_name}
                        className="font-medium text-sm p-2 border"
                      >
                        <DataTableHeaderCell column={column} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.data.map((row, index) => (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRecordClick(row)}
                    >
                      <TableCell className="border p-2">
                        <div className="text-sm text-center">→</div>
                      </TableCell>
                      {metadata?.columns?.map((column) => (
                        <TableCell
                          key={column.column_name}
                          className="border p-2"
                        >
                          <div className="text-sm max-w-32 truncate">
                            {formatCellValue(row[column.column_name])}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {tableData && tableData.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {tableData.totalPages} ({tableData.total}{' '}
                records)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <HugeiconsIcon icon={ArrowLeft} className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= tableData.totalPages}
                >
                  <HugeiconsIcon icon={ArrowRight} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <SheetFooter className="p-4 border-t flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
