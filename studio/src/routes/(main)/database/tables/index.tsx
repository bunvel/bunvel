import {
  DatabaseTable,
  type TableColumn,
} from '@/components/database/database-table'
import { TableFormSheet } from '@/components/editor/table-form-sheet'
import { Button } from '@/components/ui/button'
import { TableCell, TableHead, TableRow } from '@/components/ui/table'
import { useDatabaseTables } from '@/hooks/queries/useTables'
import { SearchParams } from '@/types'
import {
  EyeFreeIcons,
  PropertyViewFreeIcons,
  TableIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, Link, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/database/tables/')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'row_count', header: 'Rows' },
  { key: 'total_size', header: 'Size' },
  { key: 'column_count', header: '' },
]

function RouteComponent() {
  const search = useSearch({ strict: false }) as SearchParams
  const { schema } = search

  const {
    data: tables = [],
    isLoading,
    error,
  } = useDatabaseTables(schema || 'public')

  // Custom header row
  const headerRow = (cols: TableColumn[]) => (
    <TableRow>
      {cols.map((column) => (
        <TableHead key={column.key} style={{ width: column.width || 'auto' }}>
          {column.header}
        </TableHead>
      ))}
    </TableRow>
  )

  // Custom body row
  const bodyRow = (item: any, index: number) => {
    const isView = item.kind === 'VIEW'
    const isMaterializedView = item.kind === 'MATERIALIZED VIEW'

    return (
      <TableRow key={index}>
        <TableCell className="font-medium">
          <p className="flex">
            <HugeiconsIcon
              icon={
                isView
                  ? EyeFreeIcons
                  : isMaterializedView
                    ? PropertyViewFreeIcons
                    : TableIcon
              }
              className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
            />
            <span className="truncate">{item.name}</span>
          </p>
        </TableCell>
        <TableCell>
          {item.description || (
            <span className="text-muted-foreground">No Description</span>
          )}
        </TableCell>
        <TableCell>{item.row_count?.toLocaleString() || '0'}</TableCell>
        <TableCell>{item.total_size || '0 KB'}</TableCell>
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            render={
              <Link to="/database/tables/$oid" params={{ oid: item.oid }}>
                {item.column_count} columns
              </Link>
            }
          ></Button>
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
        searchFields={['name', 'description']}
        searchPlaceholder="Search for a table"
        headerRow={headerRow}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
        leftActions={<TableFormSheet schema={schema!} />}
      />
    </div>
  )
}
