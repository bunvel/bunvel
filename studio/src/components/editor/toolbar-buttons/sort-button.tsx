import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Sort, SortingAZ02Icon, SortingZA01Icon, X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { SortableItem } from './sortable-item'

interface SortButtonProps {
  schema: string
  table: string
  onSortChange?: (sorts: SortConfig[]) => void
  initialSorts?: SortConfig[]
}

type SortConfig = {
  column: string
  direction: 'asc' | 'desc'
}

export function SortButton({ 
  schema, 
  table, 
  onSortChange,
  initialSorts = []
}: SortButtonProps) {
  const [sorts, setSorts] = useState<SortConfig[]>(initialSorts)
  const [pendingSorts, setPendingSorts] = useState<SortConfig[]>(initialSorts)
  const [open, setOpen] = useState(false)

  const { data: tableMetadata } = useTableMetadata(schema, table)
  const columns = tableMetadata?.columns || []

  // Sync pending sorts when dropdown opens
  useEffect(() => {
    if (open) {
      setPendingSorts(sorts)
    }
  }, [open, sorts])

  const availableColumns = columns.filter(
    col => !pendingSorts.some(sort => sort.column === col.column_name)
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Removed handleAddSort as it's no longer needed

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    
    if (active.id !== over?.id) {
      setPendingSorts((items) => {
        const oldIndex = items.findIndex(item => `${item.column}-${item.direction}` === active.id)
        const newIndex = items.findIndex(item => `${item.column}-${item.direction}` === over?.id)
        
        const newItems = [...items]
        const [movedItem] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, movedItem)
        
        return newItems
      })
    }
  }

  const handleToggleSortDirection = (column: string) => {
    setPendingSorts(prev =>
      prev.map(sort =>
        sort.column === column
          ? { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
          : sort
      )
    )
  }

  const handleRemoveSort = (column: string) => {
    setPendingSorts(prev => prev.filter(sort => sort.column !== column))
  }

  const handleApplySorting = () => {
    setSorts(pendingSorts)
    onSortChange?.(pendingSorts)
    setOpen(false)
  }

  const handleCancel = () => {
    setPendingSorts(sorts)
    setOpen(false)
  }

  const handleClearAll = () => {
    setPendingSorts([])
  }

  const hasChanges = JSON.stringify(sorts) !== JSON.stringify(pendingSorts)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <HugeiconsIcon icon={Sort} size={16} />
          Sort
          {sorts.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              {sorts.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-[400px]" 
        align="start"
        autoFocus={false}
      >
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="p-0">Sort Columns</DropdownMenuLabel>
            {pendingSorts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-auto px-2 py-1 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Existing Sorts */}
          <div className="max-h-[300px] space-y-2 overflow-y-auto px-2 py-2">
            {pendingSorts.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No sorts applied
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={pendingSorts.map(sort => `${sort.column}-${sort.direction}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {pendingSorts.map((sort, index) => (
                    <SortableItem
                      key={`${sort.column}-${sort.direction}`}
                      id={`${sort.column}-${sort.direction}`}
                      onToggleDirection={() => handleToggleSortDirection(sort.column)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-background text-xs font-medium">
                          {index + 1}
                        </span>
                        <HugeiconsIcon
                          icon={sort.direction === 'asc' ? SortingAZ02Icon : SortingZA01Icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <span className="text-sm flex-1">{sort.column}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-transparent hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveSort(sort.column)
                          }}
                        >
                          <HugeiconsIcon icon={X} className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Add New Sort Button */}
          <div className="border-t px-2 py-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                if (availableColumns.length > 0) {
                  setPendingSorts(prev => [
                    ...prev,
                    { 
                      column: availableColumns[0].column_name, 
                      direction: 'asc' 
                    }
                  ]);
                }
              }}
              disabled={availableColumns.length === 0}
            >
              <HugeiconsIcon icon={Plus} size={14} />
              Add Sort
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 border-t px-2 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplySorting}
              disabled={!hasChanges}
              size="sm"
              className="flex-1"
            >
              Apply Sorting
            </Button>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}