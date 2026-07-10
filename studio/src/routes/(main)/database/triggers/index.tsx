import { DatabaseTable } from '@/components/database/database-table'
import { TableCell, TableRow } from '@/components/ui/table'
import { useDatabaseTriggers } from '@/hooks/queries/useTables'
import type { TableColumn } from '@/types/components'
import type { DatabaseTrigger } from '@/types/database'
import { PLACEHOLDERS } from '@/constants/ui'
import { createFileRoute } from '@tanstack/react-router'
import { parseAsString, useQueryStates, createStandardSchemaV1 } from 'nuqs'

export const Route = createFileRoute('/(main)/database/triggers/')({
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
  { key: 'trigger_name', header: 'Name' },
  { key: 'table_name', header: 'Table' },
  { key: 'function_name', header: 'Function' },
  { key: 'timing_events', header: 'Events' },
  { key: 'orientation', header: 'Orientation' },
]

function RouteComponent() {
  const [{ schema }] = useQueryStates({
    schema: parseAsString.withDefault('public'),
  })

  const {
    data: triggers = [],
    isLoading,
    error,
  } = useDatabaseTriggers(schema)

  // Custom body row
  const bodyRow = (trigger: DatabaseTrigger, index: number) => {
    return (
      <TableRow key={index}>
        <TableCell className="font-medium">
          <span className="truncate">{trigger.trigger_name}</span>
        </TableCell>
        <TableCell>{trigger.table_name}</TableCell>
        <TableCell>{trigger.function_name}</TableCell>
        <TableCell className="text-xs">
          {`${trigger.timing} ${trigger.events}`}
        </TableCell>
        <TableCell>{trigger.orientation}</TableCell>
      </TableRow>
    )
  }

  return (
    <div className="p-4">
      <DatabaseTable
        columns={columns}
        data={triggers}
        searchable={true}
        searchFields={[
          'trigger_name',
          'table_name',
          'function_name',
          'events',
          'timing',
        ]}
        searchPlaceholder={PLACEHOLDERS.SEARCH_TRIGGERS}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
