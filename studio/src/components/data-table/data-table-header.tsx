import { flexRender } from '@tanstack/react-table'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function DataTableHeader({ table }: { table: any }) {
  return (
    <TableHeader className="sticky top-0 z-10 bg-secondary">
      {table.getHeaderGroups().map((headerGroup: any) => (
        <TableRow key={headerGroup.id} className="border-b">
          {headerGroup.headers.map((header: any) => (
            <TableHead
              key={header.id}
              className="border-r"
              style={{
                width: header.column.getSize(),
                minWidth: header.column.getSize(),
                maxWidth: '350px',
              }}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}
