import { cn } from '@/lib/utils'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
      strokeWidth={2}
    />
  )
}

export { Spinner }
