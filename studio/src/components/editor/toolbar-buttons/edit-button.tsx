import { Button } from '@/components/ui/button'
import { Edit } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

interface EditButtonProps {
  selectRows: any[]
  disabled?: boolean
}

export function EditButton({ selectRows, disabled = false }: EditButtonProps) {
  const isDisabled = selectRows.length !== 1 || disabled

  const onClick = () => {
    toast('Edit selected rows:', { description: JSON.stringify(selectRows, null, 2) })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1"
      disabled={isDisabled}
    >
      <HugeiconsIcon icon={Edit} className="h-4 w-4" />
      <span>Edit</span>
    </Button>
  )
}
