import { TableKind } from '@/types'
import { FilterOperator } from '@/utils/constant'
import { isReadonlySchema } from '@/utils/func'
import {
  CopyButton,
  DeleteButton,
  EditButton,
  ExportButton,
  FilterButton,
  InsertButton,
  SortButton,
} from './toolbar-buttons'

export interface TableToolbarProps {
  selectedRows: any[]
  schema: string
  table: string
  kind: TableKind | undefined
  sorts?: Array<{ column: string; direction: 'asc' | 'desc' }>
  filters?: Array<{
    column: string
    operator: FilterOperator
    value: string
  }>
  onSortChange?: (
    sorts: Array<{ column: string; direction: 'asc' | 'desc' }>,
  ) => void
  onFilterChange?: (
    filters: Array<{
      column: string
      operator: FilterOperator
      value: string
    }>,
  ) => void
}

export function TableToolbar({
  selectedRows,
  schema,
  table,
  kind,
  sorts = [],
  filters = [],
  onSortChange = () => {},
  onFilterChange = () => {},
}: TableToolbarProps) {
  const hasSelection = selectedRows.length > 0
  const isReadOnly = isReadonlySchema(schema)

  return (
    <div className="bg-muted/50 px-4 py-2 border-b">
      {hasSelection ? (
        <div className="flex items-center space-x-2">
          {kind === 'TABLE' && (
            <DeleteButton selectRows={selectedRows} disabled={isReadOnly} />
          )}
          {kind === 'TABLE' && (
            <EditButton selectRows={selectedRows} disabled={isReadOnly} />
          )}
          <CopyButton selectedRows={selectedRows} table={table} />
          <ExportButton
            selectedRows={selectedRows}
            table={table}
            schema={schema}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            {kind === 'TABLE' && <InsertButton disabled={isReadOnly} />}
            <FilterButton
              schema={schema}
              table={table}
              initialFilters={filters}
              onFilterChange={onFilterChange}
            />
            <SortButton
              schema={schema}
              table={table}
              initialSorts={sorts}
              onSortChange={onSortChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}
