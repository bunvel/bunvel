import { DatabaseTable } from '@/components/database/database-table'
import { TableCell, TableRow } from '@/components/ui/table'
import { useDatabaseFunctions } from '@/hooks/queries/useTables'
import type { TableColumn } from '@/types/components'
import { DatabaseFunction } from '@/types/database'
import { SchemaTable } from '@/types/schema'
import { PLACEHOLDERS } from '@/constants/ui'
import { createFileRoute, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/database/functions/')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'function_name', header: 'Name' },
  { key: 'arguments', header: 'Arguments' },
  { key: 'return_type', header: 'Return Type' },
  { key: 'security_type', header: 'Security' },
]

function RouteComponent() {
  const search = useSearch({ strict: false }) as Partial<SchemaTable>
  const { schema } = search

  const {
    data: functions = [],
    isLoading,
    error,
  } = useDatabaseFunctions(schema || 'public')

  // Custom body row
  const bodyRow = (func: DatabaseFunction, index: number) => {
    return (
      <TableRow key={index}>
        <TableCell className="font-medium">
          <span className="truncate">{func.function_name}</span>
        </TableCell>
        <TableCell className="max-w-xs truncate">
          {func.arguments || '-'}
        </TableCell>
        <TableCell className="font-mono text-sm">{func.return_type}</TableCell>
        <TableCell>
          {func.security_type === 'SECURITY DEFINER' ? 'Definer' : 'Invoker'}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="p-4">
      <DatabaseTable
        columns={columns}
        data={functions}
        searchable={true}
        searchFields={['function_name', 'arguments', 'return_type']}
        searchPlaceholder={PLACEHOLDERS.SEARCH_FUNCTIONS}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
