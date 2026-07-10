import { DatabaseTable } from '@/components/database/database-table'
import { TableCell, TableRow } from '@/components/ui/table'
import { useDatabaseFunctions } from '@/hooks/queries/useTables'
import type { TableColumn } from '@/types/components'
import type { DatabaseFunction } from '@/types/database'
import { PLACEHOLDERS } from '@/constants/ui'
import { createFileRoute } from '@tanstack/react-router'
import { parseAsString, useQueryStates, createStandardSchemaV1 } from 'nuqs'

export const Route = createFileRoute('/(main)/database/functions/')({
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
  { key: 'function_name', header: 'Name' },
  { key: 'arguments', header: 'Arguments' },
  { key: 'return_type', header: 'Return Type' },
  { key: 'security_type', header: 'Security' },
]

function RouteComponent() {
  const [{ schema }] = useQueryStates({
    schema: parseAsString.withDefault('public'),
  })

  const {
    data: functions = [],
    isLoading,
    error,
  } = useDatabaseFunctions(schema)

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
