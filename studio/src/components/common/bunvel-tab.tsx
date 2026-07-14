import { TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface BunvelTabProps {
  value: string
  title: string
  isModified?: boolean
  onClose: (e: React.MouseEvent, value: string) => void
}

export function BunvelTab({
  value,
  title,
  isModified,
  onClose,
}: BunvelTabProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        'group relative flex h-9 items-center justify-between gap-2 border-r border-t-2 border-t-transparent border-r-border bg-muted/30 px-3 text-sm font-medium text-muted-foreground transition-all shrink-0 rounded-none shadow-none',
        'hover:bg-muted/60 hover:text-foreground',
        'data-[state=active]:border-t-primary data-[state=active]:bg-background data-[state=active]:text-foreground',
      )}
    >
      <span className="truncate max-w-[150px]">{title}</span>
      <div className="flex items-center justify-center w-5 h-5 shrink-0">
        {isModified && (
          <span
            className="h-2 w-2 rounded-full bg-blue-500 group-hover:hidden"
            title="Modified"
          />
        )}
        <div
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation()
            onClose(e, value)
          }}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            isModified ? 'hidden group-hover:flex' : 'opacity-0 group-hover:opacity-100',
          )}
          aria-label={`Close ${title} tab`}
        >
          <HugeiconsIcon icon={X} className="h-3 w-3" />
        </div>
      </div>
    </TabsTrigger>
  )
}
