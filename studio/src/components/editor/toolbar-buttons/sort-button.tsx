import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { useTableManager } from '@/hooks/use-table-manager'
import type { SortConfig } from '@/types'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Sorting05Icon, X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { SortableItem } from './sortable-item'

interface SortButtonProps {
  schema?: string
  table?: string
  sorts?: any[]
  onSortChange?: (sorts: any[]) => void
  recordCount?: number
}

export function SortButton({
  schema: propSchema,
  table: propTable,
  sorts: propSorts,
  onSortChange: propOnSortChange,
  recordCount: propRecordCount,
}: SortButtonProps = {}) {
  // Use props if provided, otherwise use useTableManager
  const {
    schema: hookSchema,
    table: hookTable,
    sorts: hookSorts,
    handleSortChange: hookHandleSortChange,
    tableData: hookTableData,
  } = useTableManager()

  const schema = propSchema ?? hookSchema
  const table = propTable ?? hookTable
  const sorts = propSorts ?? hookSorts
  const handleSortChange = propOnSortChange ?? hookHandleSortChange
  const recordCount = propRecordCount ?? (hookTableData?.data?.length || 0)
  const [localSorts, setLocalSorts] = useState<SortConfig[]>(sorts)
  const [pendingSorts, setPendingSorts] = useState<SortConfig[]>(sorts)
  const [open, setOpen] = useState(false)

  const { data: tableMetadata } = useTableMetadata(schema, table)
  const columns = tableMetadata?.columns || []

  // Sync pending sorts when dropdown opens
  useEffect(() => {
    if (open) {
      setPendingSorts(sorts)
    }
  }, [open, sorts])

  // Sync sorts when sorts changes (table switch)
  useEffect(() => {
    setLocalSorts(sorts)
  }, [sorts])

  const availableColumns = columns.filter(
    (col) => !pendingSorts.some((sort) => sort.column === col.column_name),
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Removed handleAddSort as it's no longer needed

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setPendingSorts((items) => {
        const oldIndex = items.findIndex(
          (item) => `${item.column}-${item.direction}` === active.id,
        )
        const newIndex = items.findIndex(
          (item) => `${item.column}-${item.direction}` === over?.id,
        )

        const newItems = [...items]
        const [movedItem] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, movedItem)

        return newItems
      })
    }
  }

  const handleToggleSortDirection = (column: string) => {
    setPendingSorts((prev) =>
      prev.map((sort) =>
        sort.column === column
          ? { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
          : sort,
      ),
    )
  }

  const handleRemoveSort = (column: string) => {
    setPendingSorts((prev) => prev.filter((sort) => sort.column !== column))
  }

  const handleColumnChange = (oldColumn: string, newColumn: string | null) => {
    if (!newColumn) return

    setPendingSorts((prev) =>
      prev.map((sort) =>
        sort.column === oldColumn ? { ...sort, column: newColumn } : sort,
      ),
    )
  }

  const handleApplySorting = () => {
    setLocalSorts(pendingSorts)
    handleSortChange(pendingSorts)
    setOpen(false)
  }

  const handleCancel = () => {
    setPendingSorts(localSorts)
    setOpen(false)
  }

  const handleClearAll = () => {
    setPendingSorts([])
  }

  const hasChanges = JSON.stringify(localSorts) !== JSON.stringify(pendingSorts)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={recordCount === 0}
          >
            <HugeiconsIcon icon={Sorting05Icon} size={16} />
            Sort
            {sorts.length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-medium">
                {sorts.length}
              </span>
            )}
          </Button>
        }
      ></PopoverTrigger>

      <PopoverContent className="w-[400px]" align="start" autoFocus={false}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <h4 className="leading-none font-medium">Sort Columns</h4>
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
                items={pendingSorts.map(
                  (sort) => `${sort.column}-${sort.direction}`,
                )}
                strategy={verticalListSortingStrategy}
              >
                {pendingSorts.map((sort, index) => {
                  const availableColumns = columns.filter(
                    (col) =>
                      !pendingSorts.some((s) => s.column === col.column_name) ||
                      sort.column === col.column_name,
                  )

                  return (
                    <SortableItem
                      key={`${sort.column}-${sort.direction}`}
                      id={`${sort.column}-${sort.direction}`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-background text-xs font-medium">
                          {index + 1}
                        </span>

                        <Select
                          value={sort.column}
                          onValueChange={(value) =>
                            handleColumnChange(sort.column, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[180px]">
                            <SelectValue title="Select column"></SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {availableColumns.map((col) => (
                              <SelectItem
                                key={col.column_name}
                                value={col.column_name}
                              >
                                {col.column_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 gap-1"
                          onClick={() => handleToggleSortDirection(sort.column)}
                        >
                          {sort.direction === 'asc' ? 'A → Z' : 'Z → A'}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-transparent hover:text-destructive ml-auto"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveSort(sort.column)
                          }}
                        >
                          <HugeiconsIcon icon={X} className="h-4 w-4" />
                        </Button>
                      </div>
                    </SortableItem>
                  )
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t px-2 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (availableColumns.length > 0) {
                setPendingSorts((prev) => [
                  ...prev,
                  {
                    column: availableColumns[0].column_name,
                    direction: 'asc',
                  },
                ])
              }
            }}
            disabled={availableColumns.length === 0}
          >
            <HugeiconsIcon icon={Plus} size={16} />
            Add Sort
          </Button>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleApplySorting}
              disabled={!hasChanges}
              size="sm"
            >
              Apply Sorting
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
