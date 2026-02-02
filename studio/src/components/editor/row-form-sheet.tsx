import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group'
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
import { useCreateRow } from '@/hooks/mutations/useCreateRow'
import { useUpdateRow } from '@/hooks/mutations/useUpdateRow'
import { useDatabaseEnums } from '@/hooks/queries/useEnums'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import type { DatabaseEnum } from '@/types/database'
import { BUTTON_LABELS } from '@/utils/constant'
import { CalendarDays, Edit, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { format } from 'date-fns'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ReferenceSelectorSheet } from './reference-selector-sheet'

// Utility functions
const formatArrayValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return `[${value.join(', ')}]`
  return value.toString()
}

const parseArrayInput = (input: string, fieldType: string): any[] => {
  let items: string[] = []

  // Check if value is in bracketed format [item1, item2, item3]
  if (input.trim().startsWith('[') && input.trim().endsWith(']')) {
    const bracketContent = input.trim().slice(1, -1).trim()
    if (bracketContent) {
      items = bracketContent.split(',').map((item) => item.trim())
    }
  } else {
    // Fallback to newline-separated values
    items = input.split('\n').map((item) => item.trim())
  }

  return items
    .filter((item) => item !== '') // Remove empty entries
    .map((item) => {
      // Check if this should be a number (for integer[], numeric[], etc.)
      if (
        fieldType.includes('int') ||
        fieldType.includes('numeric') ||
        fieldType.includes('decimal')
      ) {
        const num = parseInt(item, 10)
        return isNaN(num) ? item : num
      }
      return item
    })
}

const isNumericType = (fieldType: string): boolean => {
  return (
    fieldType.includes('int') ||
    fieldType.includes('numeric') ||
    fieldType.includes('decimal') ||
    fieldType.includes('real') ||
    fieldType.includes('double') ||
    fieldType.includes('serial')
  )
}

const isDateType = (fieldType: string): boolean => {
  return fieldType.includes('date') || fieldType.includes('time')
}

const isTextType = (fieldType: string): boolean => {
  return (
    fieldType.includes('text') ||
    fieldType.includes('varchar') ||
    fieldType.includes('char')
  )
}

const isJsonType = (fieldType: string): boolean => {
  return fieldType.includes('json')
}

// Constants
const GRID_LAYOUT_CLASS = 'grid grid-cols-[200px_1fr] gap-4 items-start'
const TEXTAREA_ROWS_TEXT = 4
const TEXTAREA_ROWS_JSON = 6

interface FormValues {
  [key: string]: string | number | boolean | null | any[]
}

interface ColumnMetadata {
  column_name: string
  data_type: string
  character_maximum_length?: number
  is_identity: string
  is_updatable: string
  is_nullable: string
  is_primary_key: boolean
  is_foreign_key: boolean
  column_default: string | null
  foreign_table_schema?: string
  foreign_table_name?: string
  foreign_column_name?: string
}

interface RowFormSheetProps {
  schema: string
  table: string
  disabled?: boolean
  mode?: 'insert' | 'edit'
  initialData?: Record<string, any>
}

export function RowFormSheet({
  schema,
  table,
  disabled,
  mode = 'insert',
  initialData = {},
}: RowFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [referenceSelectorOpen, setReferenceSelectorOpen] = useState(false)
  const [selectedForeignKeyColumn, setSelectedForeignKeyColumn] =
    useState<ColumnMetadata | null>(null)
  const { mutate: createRow, isPending: isCreatePending } = useCreateRow()
  const { mutate: updateRow, isPending: isUpdatePending } = useUpdateRow()
  const isSubmitting = isCreatePending || isUpdatePending
  const { data: metadata } = useTableMetadata(schema, table)
  const { data: enums = [] } = useDatabaseEnums(schema)

  const [formValues, setFormValues] = useState<FormValues>({})

  const resetForm = () => {
    setFormValues(mode === 'edit' ? { ...initialData } : {})
  }

  // Initialize form with initial data when mode changes or initial data changes
  useEffect(() => {
    if (mode === 'edit' && Object.keys(initialData).length > 0) {
      setFormValues({ ...initialData })
    }
  }, [mode, initialData])

  const handleInputChange = (column: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const handleReferenceSelectorOpen = (column: ColumnMetadata) => {
    setSelectedForeignKeyColumn(column)
    setReferenceSelectorOpen(true)
  }

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

      // For edit mode, include primary keys in the result for WHERE clause (even if identity)
      if (mode === 'edit' && column.is_primary_key) {
        result[column.column_name] = value
        continue
      }

      // Skip identity columns for insert mode and non-primary key identity columns for edit mode
      if (column.is_identity === 'YES') continue

      // For edit mode, include all values including NULL to allow clearing fields
      if (mode === 'edit') {
        result[column.column_name] = value
      } else if (value !== undefined && value !== '') {
        // For insert mode, include non-empty values (including explicit null)
        result[column.column_name] = value
      } else if (
        mode === 'insert' &&
        column.is_nullable === 'NO' &&
        column.column_default === null &&
        (value === undefined || value === '')
      ) {
        // Only show error for required fields that are truly empty
        return { isValid: false, values: {}, requiredField: column.column_name }
      }
    }

    return { isValid: true, values: result }
  }, [metadata, formValues, mode])

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

    if (mode === 'insert') {
      createRow(
        { schema, table, row: validation.values },
        {
          onSuccess: () => {
            setOpen(false)
            resetForm()
          },
        },
      )
    } else {
      // Extract primary keys from metadata if not available
      const primaryKeys = metadata?.primary_keys?.length
        ? metadata.primary_keys
        : metadata?.columns
            ?.filter((col) => col.is_primary_key)
            .map((col) => col.column_name) || []

      updateRow(
        { schema, table, row: validation.values, primaryKeys },
        {
          onSuccess: () => {
            setOpen(false)
            resetForm()
          },
        },
      )
    }
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
      const value = formValues[column.column_name]
      const fieldType = column.data_type.toLowerCase()

      const isDisabled =
        column.is_identity === 'YES' || column.is_updatable === 'NO'
      const isRequired =
        mode === 'insert' &&
        column.is_nullable === 'NO' &&
        column.column_default === null &&
        !column.is_primary_key
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

      const renderInputWithForeignKey = (inputElement: React.ReactNode) => {
        // Don't add dropdown to Select fields since they already have NULL options
        const isSelectField =
          React.isValidElement(inputElement) &&
          (inputElement.type === Select ||
            (inputElement.props as any)?.children?.some?.(
              (child: any) => child?.type === SelectTrigger,
            ))

        // Don't add dropdown to Popover (calendar) fields since they can't be wrapped in InputGroup
        const isPopoverField =
          React.isValidElement(inputElement) && inputElement.type === Popover

        // Check if this is an InputGroupInput field
        const isInputGroupInput =
          React.isValidElement(inputElement) &&
          (inputElement.type === InputGroupInput ||
            inputElement.type === InputGroupTextarea)

        // Add InputGroup wrapper for InputGroupInput fields for consistent styling
        // Add dropdown for fields that need it
        if (!isSelectField && !isPopoverField && isInputGroupInput) {
          const needsDropdown =
            !isDisabled && (isForeignKey || column.is_nullable === 'YES')

          if (needsDropdown) {
            return (
              <InputGroup>
                {inputElement}
                <InputGroupAddon align="inline-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          disabled={isSubmitting || isDisabled}
                        >
                          <HugeiconsIcon icon={Edit} />
                        </Button>
                      }
                    ></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {column.is_nullable === 'YES' && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleInputChange(column.column_name, null)
                          }
                        >
                          Set to NULL
                        </DropdownMenuItem>
                      )}
                      {isForeignKey && (
                        <DropdownMenuItem
                          onClick={() => handleReferenceSelectorOpen(column)}
                        >
                          Select record
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </InputGroupAddon>
              </InputGroup>
            )
          } else {
            // Just wrap in InputGroup for consistent styling, no dropdown
            return <InputGroup>{inputElement}</InputGroup>
          }
        } else {
          // For select fields, popover fields, and others, return as-is
          return inputElement
        }
      }

      if (isDateType(fieldType)) {
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
                  handleInputChange(
                    column.column_name,
                    date ? date.toISOString() : null,
                  )
                }
              />
            </PopoverContent>
          </Popover>
        )

        // Add dropdown for calendar fields if nullable or foreign key
        if (column.is_nullable === 'YES' && !isDisabled) {
          return (
            <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
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
                      onClick={() =>
                        handleInputChange(column.column_name, null)
                      }
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
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {calendarElement}
          </div>
        )
      }

      if (fieldType === 'boolean') {
        return (
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <Select
                value={value === null ? '' : value?.toString() || ''}
                onValueChange={(val) => {
                  if (val === '') {
                    handleInputChange(column.column_name, null)
                  } else {
                    handleInputChange(column.column_name, val === 'true')
                  }
                }}
                disabled={isSubmitting || isDisabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={value === null ? 'NULL' : 'Select value'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                  {column.is_nullable === 'YES' && (
                    <SelectItem value="">NULL</SelectItem>
                  )}
                </SelectContent>
              </Select>,
            )}
          </div>
        )
      }

      if (fieldType.includes('uuid')) {
        return (
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <InputGroupInput
                id={column.column_name}
                value={
                  value === null || value === undefined ? '' : String(value)
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(column.column_name, e.target.value)
                }
                placeholder={
                  value === null
                    ? 'NULL'
                    : column.is_primary_key && fieldType.includes('uuid')
                      ? 'Auto-generated UUID'
                      : `Enter ${column.column_name}`
                }
                {...commonProps}
              />,
            )}
          </div>
        )
      }

      if (isNumericType(fieldType) && !fieldType.includes('[]')) {
        return (
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <InputGroupInput
                id={column.column_name}
                type="text"
                value={
                  value === null || value === undefined ? '' : String(value)
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value
                  handleInputChange(
                    column.column_name,
                    val === '' ? null : Number(val),
                  )
                }}
                placeholder={
                  value === null
                    ? 'NULL'
                    : column.is_primary_key &&
                        (fieldType.includes('int') ||
                          fieldType.includes('serial'))
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
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <Select
                value={value === null ? '' : value?.toString() || ''}
                onValueChange={(val) => {
                  if (val === '') {
                    handleInputChange(column.column_name, null)
                  } else {
                    handleInputChange(column.column_name, val)
                  }
                }}
                disabled={isSubmitting || isDisabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      value === null ? 'NULL' : `Select ${column.column_name}`
                    }
                  />
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

      // Handle array types (text[], integer[], etc.) - must come before text handling
      if (fieldType.includes('[]')) {
        return (
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <InputGroupTextarea
                id={column.column_name}
                value={formatArrayValue(value)}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') {
                    handleInputChange(column.column_name, null)
                  } else {
                    const parsedItems = parseArrayInput(val, fieldType)
                    handleInputChange(column.column_name, parsedItems)
                  }
                }}
                placeholder={
                  value === null
                    ? 'NULL'
                    : `Enter ${column.column_name} as [item1, item2, item3] or one value per line`
                }
                {...commonProps}
                rows={TEXTAREA_ROWS_TEXT}
              />,
            )}
          </div>
        )
      }

      // Handle JSON, JSONB, and text fields with textarea
      if (
        (isJsonType(fieldType) || isTextType(fieldType)) &&
        !fieldType.includes('[]')
      ) {
        const isJsonField = isJsonType(fieldType)

        return (
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <InputGroupTextarea
                id={column.column_name}
                value={
                  value === null || value === undefined
                    ? ''
                    : isJsonField
                      ? typeof value === 'string'
                        ? value
                        : JSON.stringify(value, null, 2)
                      : String(value)
                }
                onChange={(e) => {
                  const val = e.target.value
                  if (isJsonField && val.trim()) {
                    try {
                      // Try to parse as JSON, if fails, store as string
                      const parsed = JSON.parse(val)
                      handleInputChange(column.column_name, parsed)
                    } catch {
                      // If invalid JSON, store as string
                      handleInputChange(column.column_name, val)
                    }
                  } else {
                    handleInputChange(column.column_name, val || null)
                  }
                }}
                placeholder={
                  value === null ? 'NULL' : `Enter ${column.column_name}`
                }
                {...commonProps}
                rows={
                  isTextType(fieldType) && !isJsonType(fieldType)
                    ? TEXTAREA_ROWS_TEXT
                    : TEXTAREA_ROWS_JSON
                }
              />,
            )}
          </div>
        )
      }

      // Handle varchar and char fields with input
      if (isTextType(fieldType) && !fieldType.includes('[]')) {
        return (
          <div key={column.column_name} className={GRID_LAYOUT_CLASS}>
            {renderFieldLabel()}
            {renderInputWithForeignKey(
              <InputGroupInput
                id={column.column_name}
                value={
                  value === null || value === undefined ? '' : String(value)
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(column.column_name, e.target.value)
                }
                placeholder={
                  value === null ? 'NULL' : `Enter ${column.column_name}`
                }
                {...commonProps}
              />,
            )}
          </div>
        )
      }

      // Fallback for all other field types
      return (
        <div
          key={column.column_name}
          className="grid grid-cols-[200px_1fr] gap-4 items-start"
        >
          {renderFieldLabel()}
          {renderInputWithForeignKey(
            <InputGroupInput
              id={column.column_name}
              value={value === null || value === undefined ? '' : String(value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(column.column_name, e.target.value)
              }
              placeholder={
                value === null ? 'NULL' : `Enter ${column.column_name}`
              }
              {...commonProps}
            />,
          )}
        </div>
      )
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
            variant={mode === 'edit' ? 'outline' : 'default'}
            size="sm"
            className="gap-1"
            disabled={disabled}
          >
            <HugeiconsIcon
              icon={mode === 'edit' ? Edit : Plus}
              className="h-4 w-4"
            />
            {mode === 'edit' ? BUTTON_LABELS.EDIT : BUTTON_LABELS.INSERT}
          </Button>
        }
      ></SheetTrigger>
      <SheetContent
        side="right"
        className="bg-card min-w-2xl flex flex-col overflow-visible"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="border-b p-4">
            <SheetTitle>
              {mode === 'insert' ? 'Insert New Row' : 'Edit Row'} - {table}
            </SheetTitle>
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
              {isSubmitting
                ? mode === 'insert'
                  ? 'Inserting...'
                  : 'Updating...'
                : mode === 'insert'
                  ? 'Insert Row'
                  : 'Update Row'}
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
