import { DatabaseTable } from '@/components/database/database-table'
import { TableCell, TableRow } from '@/components/ui/table'
import { useDatabaseTableColumns } from '@/hooks/queries/useTables'
import type { TableColumn } from '@/types/components'
import { PLACEHOLDERS } from '@/utils/constant'
import { Check, X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/database/tables/$oid')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'name', header: 'NAME' },
  { key: 'description', header: 'DESCRIPTION' },
  { key: 'data_type', header: 'DATA TYPE' },
  { key: 'nullable', header: 'NULLABLE' },
]

function RouteComponent() {
  const { oid } = Route.useParams()
  const { data: tables = [], isLoading, error } = useDatabaseTableColumns(oid)

  // Custom body row
  const bodyRow = (item: any, index: number) => {
    return (
      <TableRow key={index}>
        <TableCell className="font-medium">
          <span className="truncate">{item.name}</span>
        </TableCell>
        <TableCell>
          {item.description || (
            <span className="text-muted-foreground">No Description</span>
          )}
        </TableCell>
        <TableCell>{item.data_type}</TableCell>
        <TableCell>
          {item.nullable ? (
            <HugeiconsIcon icon={Check} className="text-green-500 w-4 h-4" />
          ) : (
            <HugeiconsIcon icon={X} className="text-red-500 w-4 h-4" />
          )}
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
        searchFields={['name', 'description', 'data_type']}
        searchPlaceholder={PLACEHOLDERS.SEARCH_COLUMN}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
        showSchema={false}
        showBack={true}
      />
    </div>
  )
}
