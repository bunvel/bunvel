import { cn } from '@/lib/utils'
import {
  Key01Icon,
  Link02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ColumnKeyIndicatorProps {
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  className?: string
}

export function ColumnKeyIndicator({ isPrimaryKey, isForeignKey, className }: ColumnKeyIndicatorProps) {
  if (!isPrimaryKey && !isForeignKey) {
    return null
  }

  if (isPrimaryKey && isForeignKey) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <div className={cn('flex items-center gap-0.5', className)}>
              <HugeiconsIcon
                icon={Key01Icon}
                className="h-3.5 w-3.5 text-amber-500"
              />
              <HugeiconsIcon
                icon={Link02Icon}
                className="h-3.5 w-3.5 text-blue-500"
              />
            </div>
          }
        />
        <TooltipContent>
          <p>Primary & Foreign Key</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  if (isPrimaryKey) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <HugeiconsIcon
              icon={Key01Icon}
              className={cn('h-3.5 w-3.5 text-amber-500', className)}
            />
          }
        />
        <TooltipContent>
          <p>Primary Key</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  if (isForeignKey) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <HugeiconsIcon
              icon={Link02Icon}
              className={cn('h-3.5 w-3.5 text-blue-500', className)}
            />
          }
        />
        <TooltipContent>
          <p>Foreign Key</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return null
}
