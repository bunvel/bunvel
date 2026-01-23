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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCreateRow } from '@/hooks/mutations/useCreateRow'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { useDatabaseEnums } from '@/hooks/queries/useTables'
import type { DatabaseEnum } from '@/types/database'
import { BUTTON_LABELS } from '@/utils/constant'
import { CalendarDays, Edit, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { format } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ReferenceSelectorSheet } from './reference-selector-sheet'

interface ColumnMetadata {
  column_name: string
  data_type: string
  character_maximum_length?: number
  is_identity: string
  is_updatable: string
  is_nullable: string
  is_primary_key: boolean
  is_foreign_key: boolean
  column_default: any
  foreign_table_schema?: string
  foreign_table_name?: string
  foreign_column_name?: string
}

interface FormValues {
  [key: string]: any
}

interface RowFormSheetProps {
  schema: string
  table: string
  disabled?: boolean
}

export function RowFormSheet({ schema, table, disabled }: RowFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [referenceSelectorOpen, setReferenceSelectorOpen] = useState(false)
  const [selectedForeignKeyColumn, setSelectedForeignKeyColumn] =
    useState<ColumnMetadata | null>(null)
  const { mutate: createRow, isPending: isSubmitting } = useCreateRow()
  const { data: metadata } = useTableMetadata(schema, table)
  const { data: enums = [] } = useDatabaseEnums(schema)

  const [formValues, setFormValues] = useState<FormValues>({})

  const resetForm = () => {
    setFormValues({})
  }

  const handleInputChange = useCallback((column: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [column]: value,
    }))
  }, [])

  const handleReferenceSelectorOpen = useCallback((column: ColumnMetadata) => {
    setSelectedForeignKeyColumn(column)
    setReferenceSelectorOpen(true)
  }, [])

  const handleRecordSelect = useCallback(
    (record: any) => {
      if (!selectedForeignKeyColumn) return

      const columnName = selectedForeignKeyColumn.column_name
      const foreignColumnName = selectedForeignKeyColumn.foreign_column_name
      const primaryKey = metadata?.primary_keys?.[0]

      const value =
        foreignColumnName && record[foreignColumnName] !== undefined
          ? record[foreignColumnName]
          : primaryKey && record[primaryKey] !== undefined
            ? record[primaryKey]
            : null

      if (value !== null && value !== undefined) {
        handleInputChange(columnName, value)
        setReferenceSelectorOpen(false)
        setSelectedForeignKeyColumn(null)
      }
    },
    [selectedForeignKeyColumn, metadata, handleInputChange],
  )

  const validateAndFilterValues = useCallback(() => {
    if (!metadata?.columns) return { isValid: false, values: {} }

    const result: FormValues = {}

    for (const column of metadata.columns) {
      const value = formValues[column.column_name]

      if (column.is_identity === 'YES') continue

      if (value !== undefined && value !== '' && value !== null) {
        result[column.column_name] = value
      } else if (
        column.is_nullable === 'NO' &&
        column.column_default === null
      ) {
        return { isValid: false, values: {}, requiredField: column.column_name }
      }
    }

    return { isValid: true, values: result }
  }, [metadata, formValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!metadata?.columns) {
      toast.error('Table metadata not available')
      return
    }

    const validation = validateAndFilterValues()

    if (!validation.isValid) {
      if (validation.requiredField) {
        toast.error(`Field "${validation.requiredField}" is required`)
      } else {
        toast.error('At least one field value is required')
      }
      return
    }

    if (Object.keys(validation.values).length === 0) {
      toast.error('At least one field value is required')
      return
    }

    createRow(
      { schema, table, row: validation.values },
      {
        onSuccess: () => {
          setOpen(false)
          resetForm()
        },
      },
    )
  }

  const fieldGroups = useMemo(() => {
    if (!metadata?.columns)
      return { primaryKey: [], required: [], optional: [] }

    const primaryKey = metadata.columns.filter(
      (column) => column.is_primary_key,
    )
    const required = metadata.columns.filter(
      (column) =>
        column.is_identity !== 'YES' &&
        !column.is_primary_key &&
        column.is_nullable === 'NO' &&
        column.column_default === null,
    )
    const optional = metadata.columns.filter(
      (column) =>
        column.is_identity !== 'YES' &&
        !column.is_primary_key &&
        (column.is_nullable === 'YES' || column.column_default !== null),
    )

    return { primaryKey, required, optional }
  }, [metadata])

  // Group enum values by enum name for easy lookup
  const enumValuesMap = useMemo(() => {
    const grouped: Record<string, string[]> = {}
    enums.forEach((item: DatabaseEnum) => {
      if (!grouped[item.enum_name]) {
        grouped[item.enum_name] = []
      }
      grouped[item.enum_name].push(item.enum_value)
    })
    return grouped
  }, [enums])

  // Check if a data_type is a custom enum
  const isCustomEnum = useCallback(
    (dataType: string) => {
      return Object.keys(enumValuesMap).includes(dataType)
    },
    [enumValuesMap],
  )

  const renderFormField = useCallback(
    (column: ColumnMetadata) => {
      const value = formValues[column.column_name] || ''
      const fieldType = column.data_type.toLowerCase()
      const isDisabled =
        column.is_identity === 'YES' || column.is_updatable === 'NO'
      const isRequired =
        column.is_nullable === 'NO' && column.column_default === null
      const isForeignKey = column.is_foreign_key
      const commonProps = {
        disabled: isSubmitting || isDisabled,
        required: isRequired,
      }

      const renderFieldLabel = () => (
        <div className="flex flex-col">
          <Label htmlFor={column.column_name} className="text-sm font-medium">
            {column.column_name}
          </Label>
          <span className="text-xs text-muted-foreground mt-1">
            {column.data_type}
            {column.character_maximum_length &&
              `(${column.character_maximum_length})`}
          </span>
        </div>
      )

      const renderInputWithForeignKey = (inputElement: React.ReactNode) => (
        <div className="flex gap-2">
          <div className="flex-1">{inputElement}</div>
          {isForeignKey && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleReferenceSelectorOpen(column)}
                    disabled={isSubmitting || isDisabled}
                  >
                    <HugeiconsIcon icon={Edit} className="h-4 w-4" />
                  </Button>
                }
              ></TooltipTrigger>
              <TooltipContent>
                <p>
                  Select a record from {column.foreign_table_schema}.
                  {column.foreign_table_name}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )

      if (fieldType.includes('date') || fieldType.includes('time')) {
        return (
          <div
            key={column.column_name}
            className="grid grid-cols-[200px_1fr] gap-4 items-start"
          >
            {renderFieldLabel()}
            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!value ? 'text-muted-foreground' : ''}`}
                  disabled={isSubmitting || isDisabled}
                >
                  <HugeiconsIcon icon={CalendarDays} className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
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

      if (fieldType.includes('uuid')) {
        return (
          <div
            key={column.column_name}
            className="grid grid-cols-[200px_1fr] gap-4 items-start"
          >
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <Input
                id={column.column_name}
                value={value || ''}
                onChange={(e) =>
                  handleInputChange(column.column_name, e.target.value)
                }
                placeholder={
                  column.is_primary_key && fieldType.includes('uuid')
                    ? 'Auto-generated UUID'
                    : `Enter ${column.column_name}`
                }
                {...commonProps}
              />,
            )}
          </div>
        )
      }

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
            {renderInputWithForeignKey(
              <Textarea
                id={column.column_name}
                value={value || ''}
                onChange={(e) =>
                  handleInputChange(column.column_name, e.target.value)
                }
                placeholder={`Enter ${column.column_name}`}
                {...commonProps}
                rows={fieldType.includes('text') ? 4 : 2}
              />,
            )}
          </div>
        )
      }

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
            {renderInputWithForeignKey(
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
                  column.is_primary_key &&
                  (fieldType.includes('int') || fieldType.includes('serial'))
                    ? 'Auto-increment'
                    : `Enter ${column.column_name}`
                }
                {...commonProps}
              />,
            )}
          </div>
        )
      }

      // Handle custom enum types
      if (isCustomEnum(column.data_type)) {
        const enumValues = enumValuesMap[column.data_type] || []
        return (
          <div
            key={column.column_name}
            className="grid grid-cols-[200px_1fr] gap-4 items-start"
          >
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <Select
                value={value?.toString() || ''}
                onValueChange={(val) =>
                  handleInputChange(column.column_name, val)
                }
                disabled={isSubmitting || isDisabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${column.column_name}`} />
                </SelectTrigger>
                <SelectContent>
                  {enumValues.map((enumValue) => (
                    <SelectItem key={enumValue} value={enumValue}>
                      {enumValue}
                    </SelectItem>
                  ))}
                  {column.is_nullable === 'YES' && (
                    <SelectItem value="">NULL</SelectItem>
                  )}
                </SelectContent>
              </Select>,
            )}
          </div>
        )
      }

      return null
    },
    [
      formValues,
      isSubmitting,
      handleInputChange,
      handleReferenceSelectorOpen,
      isCustomEnum,
      enumValuesMap,
    ],
  )

  const renderFieldSection = useCallback(
    (title: string, columns: ColumnMetadata[], isOptional = false) => {
      if (columns.length === 0) return null

      return (
        <>
          <div
            className={`${isOptional && (fieldGroups.primaryKey.length > 0 || fieldGroups.required.length > 0) ? 'border-t pt-6' : ''}`}
          >
            <div className="space-y-2">
              <h3
                className={`text-sm font-medium ${isOptional ? 'text-muted-foreground' : 'text-foreground'}`}
              >
                {title}
              </h3>
              {isOptional && (
                <p className="text-xs text-muted-foreground">
                  These are columns that do not need any value
                </p>
              )}
            </div>
          </div>
          <div className="space-y-6">
            {columns.map((column) => renderFormField(column))}
          </div>
        </>
      )
    },
    [fieldGroups, renderFormField],
  )

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
                {renderFieldSection('Primary Key', fieldGroups.primaryKey)}
                {renderFieldSection('Required Fields', fieldGroups.required)}
                {renderFieldSection(
                  'Optional Fields',
                  fieldGroups.optional,
                  true,
                )}
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

      {/* Reference Selector Sheet */}
      <ReferenceSelectorSheet
        open={referenceSelectorOpen}
        onOpenChange={setReferenceSelectorOpen}
        foreignKeyColumn={selectedForeignKeyColumn}
        onRecordSelect={handleRecordSelect}
      />
    </Sheet>
  )
}
