import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTableManager } from '@/hooks/use-table-manager'
import { BUTTON_LABELS } from '@/utils/constant'
import { isReadonlySchema } from '@/utils/func'
import { Edit } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

export function EditButton() {
  const { selectedRows, schema } = useTableManager()
  const isDisabled =
    selectedRows.length !== 1 || (schema ? isReadonlySchema(schema) : false)

  const onClick = () => {
    toast.info('Edit functionality not yet implemented', {
      description: `Selected row: ${JSON.stringify(selectedRows[0] || {}, null, 2)}`,
    })
  }

  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1"
      disabled={isDisabled}
    >
      <HugeiconsIcon icon={Edit} className="h-4 w-4" />
      <span>{BUTTON_LABELS.EDIT}</span>
    </Button>
  )

  if (!isDisabled) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="inline-flex">{button}</span>}
      ></TooltipTrigger>
      <TooltipContent>Select a single row to enable editing.</TooltipContent>
    </Tooltip>
  )
}
