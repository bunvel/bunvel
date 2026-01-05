import { Button } from '@/components/ui/button'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

export function InsertButton({ disabled = false }: { disabled?: boolean }) {
  const onClick = () => {
    toast.info('Insert functionality not yet implemented', { description: 'Adding new rows will be available in a future update' })
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className="gap-1"
      disabled={disabled}
    >
      <HugeiconsIcon icon={Plus} className="h-4 w-4" />
      <span>Insert</span>
    </Button>
  )
}
