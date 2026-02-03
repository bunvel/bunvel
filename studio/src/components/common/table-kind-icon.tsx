import { cn } from '@/lib/utils'
import {
  EyeFreeIcons,
  PropertyViewFreeIcons,
  TableIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface TableKindIconProps {
  kind: string
  className?: string
}

export function TableKindIcon({ kind, className }: TableKindIconProps) {
  const isView = kind === 'VIEW'
  const isMaterializedView = kind === 'MATERIALIZED VIEW'

  const icon = isView
    ? EyeFreeIcons
    : isMaterializedView
      ? PropertyViewFreeIcons
      : TableIcon

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <HugeiconsIcon
            icon={icon}
            className={cn(
              'mr-2 h-4 w-4 shrink-0 text-muted-foreground',
              className,
            )}
          />
        }
      />
      <TooltipContent>{kind}</TooltipContent>
    </Tooltip>
  )
}
