import { Button } from '@/components/ui/button'
import { Sort } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

export function SortButton() {

  const onClick = () => {
    toast('Sort not implemented yet')
  }
  
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-1">
      <HugeiconsIcon icon={Sort} className="h-4 w-4" />
      <span>Sort</span>
    </Button>
  )
}
