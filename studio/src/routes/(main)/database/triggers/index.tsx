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
import { useDatabaseTriggers } from '@/hooks/queries/useTables'
import { DatabaseTrigger } from '@/services/table.service'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

interface SearchParams {
  schema?: string
}

export const Route = createFileRoute('/(main)/database/triggers/')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'trigger_name', header: 'Name' },
  { key: 'table_name', header: 'Table' },
  { key: 'function_name', header: 'Function' },
  { key: 'timing_events', header: 'Events' },
  { key: 'orientation', header: 'Orientation' },
  { key: 'actions', header: '' },
]

function RouteComponent() {
  const [selectedTrigger, setSelectedTrigger] =
    useState<DatabaseTrigger | null>(null)
  const search = useSearch({ strict: false }) as SearchParams
  const { schema } = search

  const {
    data: triggers = [],
    isLoading,
    error,
  } = useDatabaseTriggers(schema || 'public')

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
        <TableCell>
          <Sheet
            onOpenChange={(open) =>
              open ? setSelectedTrigger(trigger) : setSelectedTrigger(null)
            }
          >
            <SheetTrigger
              render={
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              }
            ></SheetTrigger>
            <SheetContent
              side="right"
              className="bg-card min-w-2xl flex flex-col"
            >
              <SheetHeader className="border-b p-4">
                <SheetTitle>
                  Trigger: {selectedTrigger?.trigger_name}
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 p-4 overflow-auto space-y-4">
                <div>
                  <h3 className="font-medium">Table</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrigger?.table_name}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Function</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrigger?.function_name}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Events</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrigger?.events}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Timing</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrigger?.timing}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Orientation</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrigger?.orientation}
                  </p>
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
        data={triggers}
        searchable={true}
        searchFields={[
          'trigger_name',
          'table_name',
          'function_name',
          'events',
          'timing',
        ]}
        searchPlaceholder="Search triggers..."
        headerRow={headerRow}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
