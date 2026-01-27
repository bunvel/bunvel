import { Button } from '@/components/ui/button'
import { useTableManager } from '@/hooks/use-table-manager'
import { BUTTON_LABELS } from '@/utils/constant'
import { isReadonlySchema } from '@/utils/func'
import { RowFormSheet } from '../row-form-sheet'

export function EditButton() {
  const { selectedRows, schema, table } = useTableManager()
  const isDisabled =
    selectedRows.length !== 1 || (schema ? isReadonlySchema(schema) : false)

  const selectedRow = selectedRows[0] || {}

  if (!schema || !table) {
    return (
      <Button variant="outline" size="sm" className="gap-1" disabled={true}>
        {BUTTON_LABELS.EDIT}
      </Button>
    )
  }

  return (
    <RowFormSheet
      schema={schema}
      table={table}
      mode="edit"
      initialData={selectedRow}
      disabled={isDisabled}
    />
  )
}
