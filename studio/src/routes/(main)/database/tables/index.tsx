import { TableKindIcon } from '@/components/common/table-kind-icon'
import { DatabaseTable } from '@/components/database/database-table'
import { TableFormSheet } from '@/components/editor/table-form-sheet'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useDatabaseTables } from '@/hooks/queries/useTables'
import type { TableColumn } from '@/types/components'
import type { DatabaseTables } from '@/types/database'
import { PLACEHOLDERS } from '@/constants/ui'
import { LayoutTwoColumnIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { parseAsString, useQueryStates, createStandardSchemaV1 } from 'nuqs'

export const Route = createFileRoute('/(main)/database/tables/')({
  component: RouteComponent,
  validateSearch: createStandardSchemaV1(
    {
      schema: parseAsString.withDefault('public'),
    },
    { partialOutput: true },
  ),
})

// Define the table columns
const columns: Array<TableColumn> = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'row_count', header: 'Rows (ESTIMATED)' },
  { key: 'total_size', header: 'Size (ESTIMATED)' },
  { key: 'column_count', header: '' },
]

function RouteComponent() {
  const [{ schema }] = useQueryStates({
    schema: parseAsString.withDefault('public'),
  })

  const {
    data: tables = [],
    isLoading,
    error,
  } = useDatabaseTables(schema)

  // Custom body row
  const bodyRow = (item: DatabaseTables, index: number) => {
    const isTable = item.kind === 'TABLE'

    return (
      <TableRow key={index}>
        <TableCell className="font-medium">
          <p className="flex">
            <TableKindIcon kind={item.kind} />
            <span className="truncate">{item.name}</span>
          </p>
        </TableCell>
        <TableCell>
          {item.description || (
            <span className="text-muted-foreground">No Description</span>
          )}
        </TableCell>
        <TableCell>
          {isTable ? item.row_count?.toLocaleString() || '0' : '-'}
        </TableCell>
        <TableCell>{isTable ? item.total_size || '0 KB' : '-'}</TableCell>
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            render={
              <Link to="/database/tables/$oid" params={{ oid: item.oid }}>
                {item.column_count} columns
                <HugeiconsIcon icon={LayoutTwoColumnIcon} />
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
        searchPlaceholder={PLACEHOLDERS.SEARCH_TABLE}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
        leftActions={
          <TableFormSheet schema={schema!} children={<p>Create Table</p>} />
        }
      />
    </div>
  )
}
