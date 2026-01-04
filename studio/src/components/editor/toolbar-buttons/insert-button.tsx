import { Button } from '@/components/ui/button'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

export function InsertButton({ disabled = false }: { disabled?: boolean }) {
  const onClick = () => {
    toast('Insert not implemented yet')
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
