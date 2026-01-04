import { Button } from '@/components/ui/button'
import { Trash } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

interface DeleteButtonProps {
  selectRows: any[]
  disabled?: boolean
}

export function DeleteButton({ selectRows, disabled = false }: DeleteButtonProps) {
  const onClick = () => {
    toast('Delete selected rows:', { description: selectRows.length })
  }

  return (
    <Button variant="destructive" size="sm" onClick={onClick} disabled={disabled}>
      <HugeiconsIcon icon={Trash} className="h-4 w-4" />
      <span>
        Delete {selectRows.length} {selectRows.length === 1 ? 'row' : 'rows'}
      </span>
    </Button>
  )
}
