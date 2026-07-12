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
import type { ColumnMetadata } from '@/types/table'
import {
  TEXTAREA_ROWS_JSON,
  TEXTAREA_ROWS_TEXT,
  formatArrayValue,
  isCustomEnum,
  isDateType,
  isJsonType,
  isNumericType,
  isTextType,
  parseArrayInput,
} from '@/utils/field-type-utils'
import { CalendarDays, Edit } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { format } from 'date-fns'
import React, { useState } from 'react'

interface FieldRendererProps {
  column: ColumnMetadata
  value: any
  isSubmitting: boolean
  mode: 'insert' | 'edit'
  enumValuesMap: Record<string, Array<string>>
  onChange: (column: string, value: any) => void
  onReferenceSelectorOpen: (column: ColumnMetadata) => void
}

export function FieldRenderer({
  column,
  value,
  isSubmitting,
  mode,
  enumValuesMap,
  onChange,
  onReferenceSelectorOpen,
}: FieldRendererProps) {
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
      </span>
    </div>
  )

  const renderInputWithForeignKey = (
    inputElement: React.ReactNode,
    options: { disableDropdown?: boolean; wrapInInputGroup?: boolean } = {}
  ) => {
    const { disableDropdown = false, wrapInInputGroup = true } = options

    if (!disableDropdown) {
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
                      onClick={() => onChange(column.column_name, null)}
                    >
                      Set to NULL
                    </DropdownMenuItem>
                  )}
                  {isForeignKey && (
                    <DropdownMenuItem
                      onClick={() => onReferenceSelectorOpen(column)}
                    >
                      Select record
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </InputGroupAddon>
          </InputGroup>
        )
      }
    }
    
    if (wrapInInputGroup) {
      return <InputGroup>{inputElement}</InputGroup>
    }
    
    return inputElement
  }

  // Date field rendering
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

  // Boolean field rendering
  if (fieldType === 'boolean') {
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        {renderInputWithForeignKey(
          <Select
            items={[
              { label: 'TRUE', value: 'TRUE' },
              { label: 'FALSE', value: 'FALSE' },
            ]}
            value={value === null ? '' : value?.toString().toUpperCase() || ''}
            onValueChange={(val) => {
              if (val === '') {
                onChange(column.column_name, null)
              } else {
                onChange(column.column_name, val === 'TRUE')
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
              <SelectItem value="TRUE">TRUE</SelectItem>
              <SelectItem value="FALSE">FALSE</SelectItem>
              {column.is_nullable === 'YES' && (
                <SelectItem value="">NULL</SelectItem>
              )}
            </SelectContent>
          </Select>,
          { disableDropdown: true, wrapInInputGroup: false }
        )}
      </div>
    )
  }

  // UUID field rendering
  if (fieldType.includes('uuid')) {
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
              onChange(column.column_name, e.target.value)
            }
            placeholder={
              value === null
                ? 'NULL'
                : column.is_primary_key && fieldType.includes('uuid')
                  ? 'Auto-generated UUID'
                  : `Enter ${column.column_name}`
            }
            {...commonProps}
          />
        )}
      </div>
    )
  }

  // Numeric field rendering
  if (isNumericType(fieldType) && !fieldType.includes('[]')) {
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        {renderInputWithForeignKey(
          <InputGroupInput
            id={column.column_name}
            type="text"
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value
              onChange(column.column_name, val === '' ? null : Number(val))
            }}
            placeholder={
              value === null
                ? 'NULL'
                : column.is_primary_key &&
                    (fieldType.includes('int') || fieldType.includes('serial'))
                  ? 'Auto-increment'
                  : `Enter ${column.column_name}`
            }
            {...commonProps}
          />
        )}
      </div>
    )
  }

  // Custom enum field rendering
  if (isCustomEnum(column.data_type, enumValuesMap)) {
    const enumValues = enumValuesMap[column.data_type] || []
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        {renderInputWithForeignKey(
          <Select
            items={enumValues.map((v) => ({ label: v, value: v }))}
            value={value === null ? '' : value?.toString() || ''}
            onValueChange={(val) => {
              if (val === '') {
                onChange(column.column_name, null)
              } else {
                onChange(column.column_name, val)
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
          { disableDropdown: true, wrapInInputGroup: false }
        )}
      </div>
    )
  }

  // Array field rendering
  if (fieldType.includes('[]')) {
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        {renderInputWithForeignKey(
          <InputGroupTextarea
            id={column.column_name}
            value={formatArrayValue(value)}
            onChange={(e) => {
              const val = e.target.value
              if (val === '') {
                onChange(column.column_name, null)
              } else {
                const parsedItems = parseArrayInput(val, fieldType)
                onChange(column.column_name, parsedItems)
              }
            }}
            placeholder={
              value === null
                ? 'NULL'
                : `Enter ${column.column_name} as [item1, item2, item3] or one value per line`
            }
            {...commonProps}
            rows={TEXTAREA_ROWS_TEXT}
          />
        )}
      </div>
    )
  }

  // JSON field rendering
  if (isJsonType(fieldType) && !fieldType.includes('[]')) {
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        <JsonFieldEditor 
          column={column} 
          value={value} 
          onChange={onChange} 
          commonProps={commonProps} 
          renderInput={renderInputWithForeignKey} 
        />
      </div>
    )
  }

  // Unbound Text field rendering
  if (fieldType === 'text' && !fieldType.includes('[]')) {
    return (
      <div
        key={column.column_name}
        className="grid grid-cols-[200px_1fr] gap-4 items-start"
      >
        {renderFieldLabel()}
        {renderInputWithForeignKey(
          <InputGroupTextarea
            id={column.column_name}
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onChange(column.column_name, e.target.value)
            }
            placeholder={
              value === null ? 'NULL' : `Enter ${column.column_name}`
            }
            {...commonProps}
            rows={TEXTAREA_ROWS_TEXT}
          />
        )}
      </div>
    )
  }

  // Text/Varchar field rendering (Single Line)
  if (isTextType(fieldType) && !fieldType.includes('[]')) {
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
              onChange(column.column_name, e.target.value)
            }
            placeholder={
              value === null ? 'NULL' : `Enter ${column.column_name}`
            }
            {...commonProps}
          />
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
            onChange(column.column_name, e.target.value)
          }
          placeholder={value === null ? 'NULL' : `Enter ${column.column_name}`}
          {...commonProps}
        />
      )}
    </div>
  )
}

function JsonFieldEditor({ column, value, onChange, commonProps, renderInput }: any) {
  const [localValue, setLocalValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const displayValue = isFocused 
    ? localValue 
    : (value === null || value === undefined 
        ? '' 
        : typeof value === 'string' 
          ? value 
          : JSON.stringify(value, null, 2))

  return renderInput(
    <InputGroupTextarea
      id={column.column_name}
      value={displayValue}
      onFocus={() => {
        setLocalValue(displayValue)
        setIsFocused(true)
      }}
      onBlur={() => {
        setIsFocused(false)
        if (localValue.trim()) {
          try {
            const parsed = JSON.parse(localValue)
            onChange(column.column_name, parsed)
          } catch {
            onChange(column.column_name, localValue)
          }
        } else {
          onChange(column.column_name, null)
        }
      }}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={value === null ? 'NULL' : `Enter ${column.column_name} (valid JSON)`}
      rows={TEXTAREA_ROWS_JSON}
      {...commonProps}
    />
  )
}
