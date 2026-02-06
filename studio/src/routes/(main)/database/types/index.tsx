import { DatabaseTable } from '@/components/database/database-table'
import { EnumFormSheet } from '@/components/editor/enum-form-sheet'
import { TableCell, TableRow } from '@/components/ui/table'
import { useDatabaseEnums } from '@/hooks/queries/useEnums'
import type { TableColumn } from '@/types/components'
import { SchemaTable } from '@/types/schema'
import { PLACEHOLDERS } from '@/constants/ui'
import { createFileRoute, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/database/types/')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'schema_name', header: 'Schema' },
  { key: 'enum_name', header: 'Name' },
  { key: 'enum_values', header: 'Values' },
]

function RouteComponent() {
  const search = useSearch({ strict: false }) as Partial<SchemaTable>
  const schema = search.schema || 'public'

  const { data: enums = [], isLoading, error } = useDatabaseEnums(schema)

  // Group enum values by enum name
  const groupedEnums = enums.reduce<
    Record<string, { schema_name: string; values: string[] }>
  >((acc, item) => {
    if (!acc[item.enum_name]) {
      acc[item.enum_name] = {
        schema_name: item.schema_name,
        values: [],
      }
    }
    acc[item.enum_name].values.push(item.enum_value)
    return acc
  }, {})

  // Convert to array for table display
  const enumData = Object.entries(groupedEnums).map(([name, data]) => ({
    enum_name: name,
    enum_values: data.values.join(', '),
    schema_name: data.schema_name,
  }))

  // Custom body row
  const bodyRow = (item: (typeof enumData)[number], index: number) => {
    return (
      <TableRow key={index}>
        <TableCell>{item.schema_name}</TableCell>
        <TableCell className="font-medium">
          <span className="truncate">{item.enum_name}</span>
        </TableCell>
        <TableCell className="max-w-xs truncate">{item.enum_values}</TableCell>
      </TableRow>
    )
  }

  return (
    <div className="p-4">
      <DatabaseTable
        columns={columns}
        data={enumData}
        searchable={true}
        searchFields={['enum_name', 'enum_values']}
        searchPlaceholder={PLACEHOLDERS.SEARCH_ENUMS}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
        leftActions={
          <EnumFormSheet schema={schema} children={<p>Create Type</p>} />
        }
      />
    </div>
  )
}
