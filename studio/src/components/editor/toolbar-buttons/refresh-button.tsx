import { Button } from '@/components/ui/button'
import { Refresh } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

export function RefreshButton() {
  const onClick = () => {
    toast('Refresh not implemented yet')
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-1">
      <HugeiconsIcon icon={Refresh} className="h-4 w-4" />
      <span>Refresh</span>
    </Button>
  )
}
