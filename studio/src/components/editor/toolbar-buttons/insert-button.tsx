import { Button } from '@/components/ui/button'
import { SchemaTable } from '@/types'
import { BUTTON_LABELS } from '@/utils/constant'
import { useSearch } from '@tanstack/react-router'
import { RowFormSheet } from '../row-form-sheet'

export function InsertButton({ disabled = false }: { disabled?: boolean }) {
  const { schema, table } = useSearch({ strict: false }) as SchemaTable

  if (!schema || !table) {
    return (
      <Button variant="default" size="sm" className="gap-1" disabled={true}>
        {BUTTON_LABELS.INSERT}
      </Button>
    )
  }

  return <RowFormSheet schema={schema} table={table} disabled={disabled} />
}
