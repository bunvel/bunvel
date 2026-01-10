import {
  DatabaseTable,
  TableColumn,
} from '@/components/database/database-table'
import { TableCell, TableHead, TableRow } from '@/components/ui/table'
import { useDatabaseTableColumns } from '@/hooks/queries/useTables'
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
  { key: 'poistion', header: 'POSITION' },
]

function RouteComponent() {
  const { oid } = Route.useParams()
  const { data: tables = [], isLoading, error } = useDatabaseTableColumns(oid)

  // Custom header row
  const headerRow = (cols: TableColumn[]) => (
    <TableRow>
      {cols.map((column) => (
        <TableHead
          key={column.key}
          style={{ width: column.width || 'auto' }}
          hidden={column.key === 'column_count'}
        >
          {column.header}
        </TableHead>
      ))}
    </TableRow>
  )

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
        <TableCell>{item.nullable ? 'Yes' : 'No'}</TableCell>
        <TableCell>{item.position}</TableCell>
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
        searchPlaceholder="Search for a column"
        headerRow={headerRow}
        bodyRow={bodyRow}
        isLoading={isLoading}
        error={error}
        showSchema={false}
        showBack={true}
      />
    </div>
  )
}
