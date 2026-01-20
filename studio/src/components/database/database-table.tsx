import { SchemaSelector } from '@/components/editor/schema-selector'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { TableColumn, TableData } from '@/types'
import { Back, Loading03Icon, Search } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as React from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
interface DatabaseTableProps<T = TableData> {
  columns: TableColumn[]
  data: T[]
  leftActions?: React.ReactNode
  /**
   * Placeholder text for the search input
   * @default 'Search...'
   */
  searchPlaceholder?: string
  /**
   * Whether to enable local search functionality
   * @default false
   */
  searchable?: boolean
  /**
   * Array of field names to include in search. If not provided, all string fields will be searchable
   */
  searchFields?: string[]
  headerRow?: (columns: TableColumn[]) => React.ReactNode
  bodyRow?: (item: T, index: number) => React.ReactNode
  isLoading?: boolean
  error?: Error | null
  showSchema?: boolean
  showBack?: boolean
  onBack?: () => void
}
export function DatabaseTable<T = TableData>({
  columns,
  data: initialData,
  leftActions,
  searchPlaceholder = 'Search...',
  searchable = false,
  searchFields,
  headerRow,
  bodyRow,
  isLoading,
  error,
  showSchema = true,
  showBack,
  onBack = () => window.history.back(),
}: DatabaseTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filter data based on search query if searchable is true
  const filteredData = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) return initialData

    const query = searchQuery.toLowerCase()
    const fieldsToSearch = searchFields || columns.map((col) => col.key)

    return initialData.filter((item) =>
      Object.entries(item as object).some(
        ([key, value]) =>
          fieldsToSearch.includes(key) &&
          value?.toString().toLowerCase().includes(query),
      ),
    )
  }, [searchQuery, initialData, searchable, searchFields, columns])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  // Default header row implementation
  const defaultHeaderRow = (cols: TableColumn[]) => (
    <TableRow>
      {cols.map((column) => (
        <TableHead
          key={column.key}
          style={{ width: column.width || 'auto' }}
          className={cn(column.className)}
        >
          {column.header}
        </TableHead>
      ))}
    </TableRow>
  )
  // Default body row implementation
  const defaultBodyRow = (item: any, index: number) => (
    <TableRow key={index}>
      {columns.map((column) => (
        <TableCell key={`${index}-${column.key}`}>
          {String(item[column.key] ?? '-')}
        </TableCell>
      ))}
    </TableRow>
  )
  const renderHeaderRow = React.useMemo(
    () => headerRow || defaultHeaderRow,
    [headerRow],
  )

  const renderBodyRow = React.useMemo(
    () => bodyRow || defaultBodyRow,
    [bodyRow],
  )

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showBack && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <HugeiconsIcon icon={Back} />
            </Button>
          )}
          {showSchema && (
            <div className="w-48 -ml-4">
              <SchemaSelector hideCreate={true} />
            </div>
          )}
          <div className="relative w-64">
            <HugeiconsIcon
              icon={Search}
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
              disabled={!searchable}
            />
          </div>
        </div>
        {leftActions}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-secondary">
            {typeof renderHeaderRow === 'function'
              ? renderHeaderRow(columns)
              : defaultHeaderRow(columns)}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="animate-spin"
                    />
                    <p className="text-sm text-muted-foreground">
                      Loading data...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-destructive">
                    <p className="font-medium">Error loading data</p>
                    <p className="text-sm text-muted-foreground">
                      {error.message}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => renderBodyRow(item, index))
            ) : searchable && searchQuery ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found for "{searchQuery}"
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
