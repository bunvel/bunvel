import { Button } from '@/components/ui/button'
import { useTableManager } from '@/hooks/use-table-manager'
import { X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CopyButton } from './toolbar-buttons/copy-button'
import { DeleteButton } from './toolbar-buttons/delete-button'
import { EditButton } from './toolbar-buttons/edit-button'
import { ExportButton } from './toolbar-buttons/export-button'
import { FilterButton } from './toolbar-buttons/filter-button'
import { InsertButton } from './toolbar-buttons/insert-button'
import { JsonViewButton } from './toolbar-buttons/json-view-button'
import { SortButton } from './toolbar-buttons/sort-button'

export function TableToolbar() {
  const { kind, selectedRows, handleSelectionClear } = useTableManager()
  const hasSelection = selectedRows.length > 0

  return (
    <div className="bg-muted/50 px-4 py-2 border-b flex flex-row justify-between">
      <div className="flex items-center">
        {hasSelection ? (
          <div className="flex items-center space-x-2">
            <DeleteButton />
            <EditButton />
            <CopyButton />
            <ExportButton />
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
      <div className="flex items-center space-x-2">
        <JsonViewButton />
      </div>
    </div>
  )
}
