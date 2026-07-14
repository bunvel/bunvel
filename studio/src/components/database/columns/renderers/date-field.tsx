import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarDays, Edit } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { format } from 'date-fns'
import type { BaseRendererProps } from '../field-renderer-types'

export function DateFieldRenderer({
  column,
  value,
  onChange,
  isDisabled,
  isSubmitting,
  renderFieldLabel,
}: BaseRendererProps) {
  const calendarElement = (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${!value ? 'text-muted-foreground' : ''}`}
            disabled={isSubmitting || isDisabled}
          >
            <HugeiconsIcon icon={CalendarDays} className="mr-2 h-4 w-4" />
            {value
              ? format(new Date(String(value)), 'PPP')
              : value === null
                ? 'NULL'
                : 'Pick a date'}
          </Button>
        }
      ></PopoverTrigger>
      <PopoverContent
        className="w-full"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={value ? new Date(String(value)) : undefined}
          onSelect={(date) =>
            onChange(column.column_name, date ? date.toISOString() : null)
          }
        />
      </PopoverContent>
    </Popover>
  )

  // Add dropdown for calendar fields if nullable or foreign key
  if (column.is_nullable === 'YES' && !isDisabled) {
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        <div className="flex gap-2">
          <div className="flex-1">{calendarElement}</div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting || isDisabled}
                >
                  <HugeiconsIcon icon={Edit} />
                </Button>
              }
            ></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onChange(column.column_name, null)}
              >
                Set to NULL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div
      key={column.column_name}
      className="grid grid-cols-[200px_1fr] gap-4 items-start"
    >
      {renderFieldLabel()}
      {calendarElement}
    </div>
  )
}
