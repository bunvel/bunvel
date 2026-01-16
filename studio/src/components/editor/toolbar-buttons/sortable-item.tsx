// sortable-item.tsx
import { Button } from '@/components/ui/button'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Sorting05Icon, X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface SortableItemProps {
  id: string
  children: React.ReactNode
  onRemove?: () => void
  onToggleDirection?: () => void
}

export function SortableItem({ id, children, onRemove, onToggleDirection }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background rounded-md border"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <HugeiconsIcon icon={GripVertical} className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex-1">
        {children}
      </div>

      {onToggleDirection && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onToggleDirection}
        >
          <HugeiconsIcon icon={Sorting05Icon} className="h-4 w-4" />
        </Button>
      )}

      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRemove}
        >
          <HugeiconsIcon icon={X} className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}