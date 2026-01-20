import { DatabaseTable } from '@/components/database/database-table'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TableCell, TableRow } from '@/components/ui/table'
import { useDatabaseEnums } from '@/hooks/queries/useTables'
import type { TableColumn } from '@/types'
import { SchemaTable } from '@/types'
import { PLACEHOLDERS } from '@/utils/constant'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(main)/database/types/')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'schema_name', header: 'Schema' },
  { key: 'enum_name', header: 'Name' },
  { key: 'enum_values', header: 'Values' },
  { key: 'actions', header: '' },
]

function RouteComponent() {
  const [selectedEnum, setSelectedEnum] = useState<{
    name: string
    values: string[]
    schema: string
  } | null>(null)
  const search = useSearch({ strict: false }) as Partial<SchemaTable>
  const { schema } = search

  const {
    data: enums = [],
    isLoading,
    error,
  } = useDatabaseEnums(schema || 'public')

  // Group enum values by enum name
  const groupedEnums = enums.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.enum_name]) {
      acc[item.enum_name] = []
    }
    acc[item.enum_name].push(item.enum_value)
    return acc
  }, {})

  // Convert to array of enums with their values
  const enumData = Object.entries(groupedEnums).map(([name, values]) => ({
    enum_name: name,
    enum_values: values.join(', '),
    schema_name: enums.find((e) => e.enum_name === name)?.schema_name || '',
    values, // Store the full array of values for the details view
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
        <TableCell>
          <Sheet
            onOpenChange={(open) =>
              open
                ? setSelectedEnum({
                    name: item.enum_name,
                    values: item.values,
                    schema: item.schema_name,
                  })
                : setSelectedEnum(null)
            }
          >
            <SheetTrigger
              render={
                <Button variant="outline" size="sm">
                  View Values
                </Button>
              }
            ></SheetTrigger>
            <SheetContent
              side="right"
              className="bg-card min-w-2xl flex flex-col"
            >
              <SheetHeader className="border-b p-4">
                <SheetTitle>{selectedEnum?.name}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 p-4 overflow-auto">
                <h3 className="text-sm font-medium mb-4">Enum Values:</h3>
                <div className="space-y-2">
                  {selectedEnum?.values.map((value, i) => (
                    <div key={i} className="px-3 py-2 bg-muted rounded-md">
                      {value}
                    </div>
                  ))}
                </div>
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
        data={enumData}
        searchable={true}
        searchFields={['enum_name', 'enum_values']}
        searchPlaceholder={PLACEHOLDERS.SEARCH_ENUMS}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
