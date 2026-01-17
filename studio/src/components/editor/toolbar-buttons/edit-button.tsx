import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
    toast.info('Edit functionality not yet implemented', {
      description: `Selected row: ${JSON.stringify(selectRows[0] || {}, null, 2)}`,
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
      <span>Edit</span>
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
