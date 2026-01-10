import {
  DatabaseTable,
  type TableColumn,
} from '@/components/database/database-table'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TableCell, TableHead, TableRow } from '@/components/ui/table'
import { useDatabaseIndexes } from '@/hooks/queries/useTables'
import { DatabaseTableIndexes } from '@/services/table.service'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

interface SearchParams {
  schema?: string
  table?: string
}

export const Route = createFileRoute('/(main)/database/indexes/')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'table_name', header: 'Table' },
  { key: 'column_name', header: 'Column' },
  { key: 'index_name', header: 'Index' },
  { key: 'index_definition', header: 'Definition' },
]

function RouteComponent() {
  const [selectedIndex, setSelectedIndex] = useState<DatabaseTableIndexes | null>(null)
  const search = useSearch({ strict: false }) as SearchParams
  const { schema } = search

  const { data: tables = [], isLoading, error } = useDatabaseIndexes(schema)

  // Custom header row
  const headerRow = (cols: TableColumn[]) => (
    <TableRow>
      {cols.map((column) => (
        <TableHead
          key={column.key}
          style={{ width: column.width || 'auto' }}
          hidden={column.key === 'index_definition'}
        >
          {column.header}
        </TableHead>
      ))}
    </TableRow>
  )

  // Custom body row
  const bodyRow = (item: DatabaseTableIndexes, index: number) => {
    return (
      <TableRow key={index}>
        <TableCell className="font-medium">
          <span className="truncate">{item.table_name}</span>
        </TableCell>
        <TableCell>{item.column_name}</TableCell>
        <TableCell>{item.index_name}</TableCell>
        <TableCell>
          <Sheet
            onOpenChange={(open) =>
              open ? setSelectedIndex(item) : setSelectedIndex(null)
            }
          >
            <SheetTrigger
              render={
                <Button variant="outline" size="sm">
                  View Definition
                </Button>
              }
            ></SheetTrigger>
            <SheetContent
              side="right"
              className="bg-card min-w-2xl flex flex-col"
            >
              <SheetHeader className="border-b p-4">
                <SheetTitle>{selectedIndex?.index_name}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 p-4 overflow-auto">
                <p>{selectedIndex?.index_definition}</p>
              </div>
            </SheetContent>
          </Sheet>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="p-4">
      <DatabaseTable
        columns={columns}
        data={tables}
        searchable={true}
        searchFields={['table_name', 'column_name', 'index_name']}
        searchPlaceholder='Search for an index'
        headerRow={headerRow}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
