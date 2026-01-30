import { useTableManager } from '@/hooks/use-table-manager'
import { X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '../ui/button'
import {
  CopyButton,
  DeleteButton,
  EditButton,
  ExportButton,
  FilterButton,
  InsertButton,
  JsonViewButton,
  SortButton,
} from './toolbar-buttons'

export function TableToolbar() {
  const { kind, selectedRows, handleSelectionClear } = useTableManager()
  const hasSelection = selectedRows.length > 0

  return (
    <div className="bg-muted/50 px-4 py-2 border-b">
      {hasSelection ? (
        <div className="flex items-center space-x-2">
          <DeleteButton />
          <EditButton />
          <CopyButton />
          <ExportButton />
          <JsonViewButton />
          <Button size="sm" variant="ghost" onClick={handleSelectionClear}>
            <HugeiconsIcon icon={X} />
            Clear Selection
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            {kind === 'TABLE' && <InsertButton />}
            <FilterButton />
            <SortButton />
          </div>
        </div>
      )}
    </div>
  )
}
