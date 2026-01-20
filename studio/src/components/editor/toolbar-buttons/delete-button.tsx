import { Button } from '@/components/ui/button'
import { BUTTON_LABELS } from '@/utils/constant'
import { Trash } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

interface DeleteButtonProps {
  selectRows: any[]
  disabled?: boolean
}

export function DeleteButton({
  selectRows,
  disabled = false,
}: DeleteButtonProps) {
  const onClick = () => {
    toast.info('Delete functionality not yet implemented', {
      description: `Selected ${selectRows.length} row${selectRows.length === 1 ? '' : 's'} will be deleted`,
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={disabled}
    >
      <HugeiconsIcon icon={Trash} className="h-4 w-4" />
      <span>
        {BUTTON_LABELS.DELETE} {selectRows.length}{' '}
        {selectRows.length === 1 ? 'row' : 'rows'}
      </span>
    </Button>
  )
}
