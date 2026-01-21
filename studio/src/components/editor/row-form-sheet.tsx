import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useCreateRow } from '@/hooks/mutations/useCreateRow'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { BUTTON_LABELS } from '@/utils/constant'
import { CalendarDays, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'

interface RowFormSheetProps {
  schema: string
  table: string
  disabled?: boolean
}

export function RowFormSheet({ schema, table, disabled }: RowFormSheetProps) {
  const [open, setOpen] = useState(false)
  const { mutate: createRow, isPending: isSubmitting } = useCreateRow()
  const { data: metadata } = useTableMetadata(schema, table)

  const [formValues, setFormValues] = useState<Record<string, any>>({})

  const resetForm = () => {
    setFormValues({})
  }

  const handleInputChange = (column: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!metadata?.columns) {
      toast.error('Table metadata not available')
      return
    }

    // Filter out empty values for non-nullable columns
    const filteredValues: Record<string, any> = {}

    metadata.columns.forEach((column) => {
      const value = formValues[column.column_name]

      // Skip auto-increment columns (identity columns)
      if (column.is_identity === 'YES') {
        return
      }

      // Include value if it's not empty, or if column is nullable
      if (value !== undefined && value !== '' && value !== null) {
        filteredValues[column.column_name] = value
      } else if (
        column.is_nullable === 'NO' &&
        column.column_default === null
      ) {
        // Required field without default
        toast.error(`Field "${column.column_name}" is required`)
        return
      }
    })

    if (Object.keys(filteredValues).length === 0) {
      toast.error('At least one field value is required')
      return
    }

    createRow(
      {
        schema,
        table,
        row: filteredValues,
      },
      {
        onSuccess: () => {
          // Only close and reset if creation succeeds
          setOpen(false)
          resetForm()
        },
      },
    )
  }

  const renderFormField = (column: any) => {
    const value = formValues[column.column_name] || ''
    const isDisabled =
      column.is_identity === 'YES' || column.is_updatable === 'NO'
    const isRequired =
      column.is_nullable === 'NO' && column.column_default === null
    const isPrimaryKey = column.is_primary_key

    // Skip identity columns (auto-increment)
    if (column.is_identity === 'YES') {
      return null
    }

    const fieldType = column.data_type.toLowerCase()
    const commonProps = {
      disabled: isSubmitting || isDisabled,
      required: isRequired,
    }

    // Helper function to render label with data type
    const renderFieldLabel = () => (
      <div className="flex flex-col">
        <Label htmlFor={column.column_name} className="text-sm font-medium">
          {column.column_name}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <span className="text-xs text-muted-foreground mt-1">
          {column.data_type}
          {column.character_maximum_length &&
            `(${column.character_maximum_length})`}
        </span>
      </div>
    )

    // Date picker for date/time types
    if (fieldType.includes('date') || fieldType.includes('time')) {
      return (
        <div
          key={column.column_name}
          className="grid grid-cols-[200px_1fr] gap-4 items-start"
        >
          {renderFieldLabel()}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !value ? 'text-muted-foreground' : ''
                  }`}
                  disabled={isSubmitting || isDisabled}
                >
                  <HugeiconsIcon icon={CalendarDays} className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP') : 'Pick a date'}
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
                selected={value ? new Date(value) : undefined}
                onSelect={(date) =>
                  handleInputChange(
                    column.column_name,
                    date ? date.toISOString() : null,
                  )
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      )
    }

    // Select for boolean types
    if (fieldType === 'boolean') {
      return (
        <div
          key={column.column_name}
          className="grid grid-cols-[200px_1fr] gap-4 items-start"
        >
          {renderFieldLabel()}
          <Select
            value={value?.toString() || ''}
            onValueChange={(val) =>
              handleInputChange(column.column_name, val === 'true')
            }
            disabled={isSubmitting || isDisabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
              {column.is_nullable === 'YES' && (
                <SelectItem value="">NULL</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )
    }

    // Text input for string types
    if (
      fieldType.includes('varchar') ||
      fieldType.includes('text') ||
      fieldType.includes('char')
    ) {
      return (
        <div
          key={column.column_name}
          className="grid grid-cols-[200px_1fr] gap-4 items-start"
        >
          {renderFieldLabel()}
          <Textarea
            id={column.column_name}
            value={value || ''}
            onChange={(e) =>
              handleInputChange(column.column_name, e.target.value)
            }
            placeholder={
              isPrimaryKey && fieldType.includes('uuid')
                ? 'Auto-generated UUID'
                : `Enter ${column.column_name}`
            }
            {...commonProps}
            rows={fieldType.includes('text') ? 4 : 2}
          />
        </div>
      )
    }

    // Number input for numeric types
    if (
      fieldType.includes('int') ||
      fieldType.includes('numeric') ||
      fieldType.includes('decimal') ||
      fieldType.includes('real') ||
      fieldType.includes('double') ||
      fieldType.includes('serial')
    ) {
      return (
        <div
          key={column.column_name}
          className="grid grid-cols-[200px_1fr] gap-4 items-start"
        >
          {renderFieldLabel()}
          <Input
            id={column.column_name}
            type="number"
            value={value || ''}
            onChange={(e) => {
              const val = e.target.value
              handleInputChange(
                column.column_name,
                val === '' ? null : Number(val),
              )
            }}
            placeholder={
              isPrimaryKey &&
              (fieldType.includes('int') || fieldType.includes('serial'))
                ? 'Auto-increment'
                : `Enter ${column.column_name}`
            }
            {...commonProps}
          />
        </div>
      )
    }

    // Default text input for other types
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        <Input
          id={column.column_name}
          type="text"
          value={value || ''}
          onChange={(e) =>
            handleInputChange(column.column_name, e.target.value)
          }
          placeholder={
            isPrimaryKey && fieldType.includes('uuid')
              ? 'Auto-generated UUID'
              : isPrimaryKey && fieldType.includes('int')
                ? 'Auto-increment'
                : `Enter ${column.column_name}`
          }
          {...commonProps}
        />
      </div>
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (newOpen) {
          resetForm()
        }
      }}
    >
      <SheetTrigger
        render={
          <Button
            variant="default"
            size="sm"
            className="gap-1"
            disabled={disabled}
          >
            <HugeiconsIcon icon={Plus} className="h-4 w-4" />
            {BUTTON_LABELS.INSERT}
          </Button>
        }
      ></SheetTrigger>
      <SheetContent
        side="right"
        className="bg-card min-w-2xl flex flex-col overflow-visible"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Insert New Row - {table}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 p-6 overflow-auto">
            {!metadata?.columns ? (
              <div className="text-center text-muted-foreground">
                Loading table metadata...
              </div>
            ) : (
              <div className="space-y-6 flex flex-col">
                {metadata.columns
                  .filter((column) => column.is_identity !== 'YES') // Skip identity columns
                  .map((column) => renderFormField(column))}
              </div>
            )}
          </div>
          <SheetFooter className="p-4 border-t flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Inserting...' : 'Insert Row'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
