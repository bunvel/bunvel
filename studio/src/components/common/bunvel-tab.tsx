import { TabsTrigger } from '@/components/ui/tabs'
import { X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface BunvelTabProps {
  value: string
  title: string
  isActive: boolean
  isModified?: boolean
  onClose: (e: React.MouseEvent, value: string) => void
}

export function BunvelTab({
  value,
  title,
  isActive,
  isModified,
  onClose,
}: BunvelTabProps) {
  return (
    <TabsTrigger
      value={value}
      className={`group relative border-none rounded-none px-4 text-sm font-medium transition-colors hover:bg-muted/50 shrink-0 ${
        isActive
          ? 'text-foreground bg-muted/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
      }`}
    >
      <div className="flex items-center">
        <span className="flex items-center gap-1">
          {title}
          {isModified && (
            <span
              className="h-2 w-2 rounded-full bg-blue-500"
              title="Modified"
            />
          )}
        </span>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => onClose(e, value)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              onClose(e as any, value)
            }
          }}
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-sm p-0.5 opacity-0 hover:bg-muted/50 group-hover:opacity-100"
          aria-label={`Close ${title} tab`}
        >
          <HugeiconsIcon icon={X} className="h-3.5 w-3.5" />
        </div>
      </div>
    </TabsTrigger>
  )
}
