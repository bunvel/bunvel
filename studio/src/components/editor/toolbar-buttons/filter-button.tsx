import { Button } from '@/components/ui/button'
import { Filter } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

export function FilterButton() {
  const onClick = () => {
    toast.info('Filter functionality not yet implemented', { description: 'Filtering rows will be available in a future update' })
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-1">
      <HugeiconsIcon icon={Filter} className="h-4 w-4" />
      <span>Filter</span>
    </Button>
  )
}
