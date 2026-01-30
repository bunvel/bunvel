import { Button } from '@/components/ui/button'
import { useTableManager } from '@/hooks/use-table-manager'
import { BUTTON_LABELS } from '@/utils/constant'
import { JsonViewSheet } from '../json-view-sheet'

export function JsonViewButton() {
  const { schema, table, selectedRows } = useTableManager()
  const isDisabled = !schema || !table || selectedRows.length === 0

  if (!schema || !table) {
    return (
      <Button variant="outline" size="sm" className="gap-1" disabled={true}>
        {BUTTON_LABELS.JSON_VIEW}
      </Button>
    )
  }

  return (
    <JsonViewSheet
      schema={schema}
      table={table}
      data={selectedRows}
      disabled={isDisabled}
    />
  )
}
