import { RowFormSheet } from '@/components/editor/row-form-sheet'
import { Button } from '@/components/ui/button'
import { useTableManager } from '@/hooks/use-table-manager'
import { BUTTON_LABELS } from '@/utils/constant'
import { isReadonlySchema } from '@/utils/func'

export function InsertButton() {
  const { schema, table } = useTableManager()
  const isDisabled = !schema || !table || isReadonlySchema(schema)

  if (!schema || !table) {
    return (
      <Button variant="default" size="sm" className="gap-1" disabled={true}>
        {BUTTON_LABELS.INSERT}
      </Button>
    )
  }

  return <RowFormSheet schema={schema} table={table} disabled={isDisabled} />
}
