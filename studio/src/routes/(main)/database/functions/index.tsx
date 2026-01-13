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
import { useDatabaseFunctions } from '@/hooks/queries/useTables'
import { DatabaseFunction } from '@/services/table.service'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

interface SearchParams {
  schema?: string
}

export const Route = createFileRoute('/(main)/database/functions/')({
  component: RouteComponent,
})

// Define the table columns
const columns: TableColumn[] = [
  { key: 'function_name', header: 'Name' },
  { key: 'arguments', header: 'Arguments' },
  { key: 'return_type', header: 'Return Type' },
  { key: 'security_type', header: 'Security' },
  { key: 'actions', header: 'Actions' },
]

function RouteComponent() {
  const [selectedFunction, setSelectedFunction] =
    useState<DatabaseFunction | null>(null)
  const search = useSearch({ strict: false }) as SearchParams
  const { schema } = search

  const {
    data: functions = [],
    isLoading,
    error,
  } = useDatabaseFunctions(schema || 'public')

  // Custom header row
  const headerRow = (cols: TableColumn[]) => (
    <TableRow>
      {cols.map((column) => (
        <TableHead
          key={column.key}
          style={{ width: column.width || 'auto' }}
          hidden={column.key === 'actions'}
        >
          {column.header}
        </TableHead>
      ))}
    </TableRow>
  )

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
        <TableCell>
          <Sheet
            onOpenChange={(open) =>
              open ? setSelectedFunction(func) : setSelectedFunction(null)
            }
          >
            <SheetTrigger>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-card min-w-2xl flex flex-col"
            >
              <SheetHeader className="border-b p-4">
                <SheetTitle>{selectedFunction?.function_name}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 p-4 overflow-auto">
                <p>Defination detail not yet implemented</p>
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
        data={functions}
        searchable={true}
        searchFields={['function_name', 'arguments', 'return_type']}
        searchPlaceholder="Search functions..."
        headerRow={headerRow}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
