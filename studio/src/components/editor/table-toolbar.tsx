import { isReadonlySchema } from '@/utils/func'
import {
  CopyButton,
  DeleteButton,
  EditButton,
  ExportButton,
  FilterButton,
  InsertButton,
  RefreshButton,
  SortButton,
} from './toolbar-buttons'

export interface TableToolbarProps {
  selectedRows: any[]
  schema?: string
  table?: string
}
export function TableToolbar({
  selectedRows,
  schema,
  table,
}: TableToolbarProps) {
  const hasSelection = selectedRows.length > 0
  const isReadOnly = isReadonlySchema(schema)

  return (
    <div className="bg-muted/50 px-4 py-2 border-b">
      <div className="flex items-center space-x-2">
        {hasSelection ? (
          <>
            <DeleteButton selectRows={selectedRows}  disabled={isReadOnly} />
            <EditButton selectRows={selectedRows}  disabled={isReadOnly} />
            <CopyButton selectedRows={selectedRows} table={table} />
            <ExportButton
              selectedRows={selectedRows}
              table={table}
              schema={schema}
            />
          </>
        ) : (
          <>
            <InsertButton disabled={isReadOnly} />
            <FilterButton />
            <SortButton />
            <RefreshButton />
          </>
        )}
      </div>
    </div>
  )
}
