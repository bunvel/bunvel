import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { useTableManager } from '@/hooks/use-table-manager'
import { FilterConfig as BaseFilterConfig } from '@/types/table'
import {
  FilterOperator,
  FilterOperatorLabels,
  FilterSqlOperators,
} from '@/utils/constant'
import {
  DndContext,
  DragEndEvent,
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
import { Filter, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { SortableItem } from './sortable-item'

// Utility function to validate filter configuration
const isFilterValid = (filter: BaseFilterConfig): boolean => {
  const operatorConfig = FilterSqlOperators[filter.operator]
  if (!operatorConfig.requiresParameter) {
    return true // IS NULL, IS NOT NULL don't need values
  }
  // Other operators must have non-empty values
  return (
    filter.value !== null && filter.value !== '' && filter.value !== undefined
  )
}

// Utility function to generate unique filter ID
const generateFilterId = (filter: BaseFilterConfig): string =>
  `${filter.column}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// Utility function to process filters with IDs
const processFiltersWithIds = (filters: BaseFilterConfig[]): FilterConfig[] =>
  filters.filter(isFilterValid).map((f) => ({ ...f, id: generateFilterId(f) }))

interface FilterConfig extends BaseFilterConfig {
  id: string
}

interface FilterButtonProps {
  schema?: string
  table?: string
  filters?: any[]
  onFilterChange?: (filters: any[]) => void
  recordCount?: number
}

export function FilterButton({
  schema: propSchema,
  table: propTable,
  filters: propFilters,
  onFilterChange: propOnFilterChange,
  recordCount: propRecordCount,
}: FilterButtonProps = {}) {
  // Use props if provided, otherwise use useTableManager
  const {
    schema: hookSchema,
    table: hookTable,
    filters: hookFilters,
    handleFilterChange: hookHandleFilterChange,
    tableData: hookTableData,
  } = useTableManager()

  const schema = propSchema ?? hookSchema
  const table = propTable ?? hookTable
  const filters = propFilters ?? hookFilters
  const handleFilterChange = propOnFilterChange ?? hookHandleFilterChange
  const recordCount = propRecordCount ?? (hookTableData?.data?.length || 0)
  // Process initial filters with validation
  const [localFilters, setLocalFilters] = useState<FilterConfig[]>(() =>
    processFiltersWithIds(filters || []),
  )
  const [pendingFilters, setPendingFilters] = useState<FilterConfig[]>(() =>
    processFiltersWithIds(filters || []),
  )
  const [open, setOpen] = useState(false)

  const { data: tableMetadata } = useTableMetadata(schema, table)
  const columns = tableMetadata?.columns || []
  const availableColumns = columns.filter(
    (col) =>
      !pendingFilters.some((filter) => filter.column === col.column_name),
  )

  // Sync pending filters when dropdown opens
  useEffect(() => {
    if (open) {
      setPendingFilters(processFiltersWithIds(filters || []))
    }
  }, [open, filters])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPendingFilters((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return items

        const newItems = [...items]
        const [movedItem] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, movedItem)

        return newItems
      })
    }
  }

  const handleRemoveFilter = (id: string) => {
    setPendingFilters((prev) => prev.filter((filter) => filter.id !== id))
  }

  const handleUpdateFilter = (id: string, updates: Partial<FilterConfig>) => {
    setPendingFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter,
      ),
    )
  }

  const handleApplyFilters = () => {
    const validFilters = pendingFilters.filter(isFilterValid)

    setLocalFilters(validFilters)
    // Strip the id before passing to parent
    handleFilterChange(validFilters.map(({ id, ...rest }) => rest))
    setOpen(false)
  }

  const handleCancel = () => {
    setPendingFilters(localFilters)
    setOpen(false)
  }

  const handleClearAll = () => {
    setPendingFilters([])
  }

  const hasChanges =
    JSON.stringify(localFilters.map(({ id, ...rest }) => rest)) !==
    JSON.stringify(pendingFilters.map(({ id, ...rest }) => rest))

  // Check if there are invalid filters (empty values)
  const hasInvalidFilters = pendingFilters.some(
    (filter: BaseFilterConfig) => !isFilterValid(filter),
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={recordCount === 0}
          >
            <HugeiconsIcon icon={Filter} size={16} />
            Filter
            {filters.length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-medium">
                {filters.length}
              </span>
            )}
          </Button>
        }
      ></DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[500px]"
        align="start"
        autoFocus={false}
      >
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="p-0 text-base">
              Filter Columns
            </DropdownMenuLabel>
            {pendingFilters.length > 0 && (
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

          {/* Existing Filters */}
          <div className="max-h-[300px] space-y-2 overflow-y-auto mb-4">
            {pendingFilters.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No filters applied
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={pendingFilters.map((filter) => filter.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {pendingFilters.map((filter) => (
                    <SortableItem
                      key={filter.id}
                      id={filter.id}
                      onRemove={() => handleRemoveFilter(filter.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Select
                            value={filter.column}
                            onValueChange={(value: string | null) => {
                              if (value !== null) {
                                handleUpdateFilter(filter.id, { column: value })
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue title="Column" />
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
                              {availableColumns.length === 0 && (
                                <div className="text-sm text-muted-foreground px-2 py-1.5">
                                  No columns available
                                </div>
                              )}
                            </SelectContent>
                          </Select>

                          <Select
                            value={filter.operator}
                            onValueChange={(value: FilterOperator | null) => {
                              if (value !== null) {
                                handleUpdateFilter(filter.id, {
                                  operator: value,
                                })
                              } else {
                                handleUpdateFilter(filter.id, {
                                  operator: '=',
                                })
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue title="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(FilterOperatorLabels).map(
                                ([operator, label]) => (
                                  <SelectItem key={operator} value={operator}>
                                    {String(label)}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>

                          {filter.operator !== 'IS NULL' &&
                            filter.operator !== 'IS NOT NULL' && (
                              <Input
                                type="text"
                                value={filter.value?.toString() ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setPendingFilters((prev) =>
                                    prev.map((f) =>
                                      f.id === filter.id ? { ...f, value } : f,
                                    ),
                                  )
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                placeholder="Value"
                              />
                            )}
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Add New Filter Button */}
          <div className="flex items-center justify-between border-t px-2 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (availableColumns.length > 0) {
                  const newFilter: FilterConfig = {
                    id: `new-${Date.now()}`,
                    column: availableColumns[0].column_name,
                    operator: '=',
                    value: null, // Use null instead of empty string
                  }
                  setPendingFilters((prev) => [...prev, newFilter])
                }
              }}
              disabled={availableColumns.length === 0}
            >
              <HugeiconsIcon icon={Plus} className="mr-2 h-4 w-4" />
              Add Filter
            </Button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyFilters}
                disabled={!hasChanges || hasInvalidFilters}
              >
                Apply
              </Button>
            </div>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
