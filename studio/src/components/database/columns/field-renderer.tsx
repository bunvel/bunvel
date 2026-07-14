import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Edit } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import React from 'react'

import {
  isCustomEnum,
  isDateType,
  isJsonType,
  isNumericType,
} from '@/utils/field-type-utils'
import type { FieldRendererProps } from './field-renderer-types'
import { ArrayFieldRenderer } from './renderers/array-field'
import { BooleanFieldRenderer } from './renderers/boolean-field'
import { DateFieldRenderer } from './renderers/date-field'
import { EnumFieldRenderer } from './renderers/enum-field'
import { JsonFieldRenderer } from './renderers/json-field'
import { NumericFieldRenderer } from './renderers/numeric-field'
import { TextFieldRenderer } from './renderers/text-field'
import { UuidFieldRenderer } from './renderers/uuid-field'

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
    options: { disableDropdown?: boolean; wrapInInputGroup?: boolean } = {},
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

  const baseProps = {
    column,
    value,
    onChange,
    isDisabled,
    isSubmitting,
    commonProps,
    renderFieldLabel,
    renderInputWithForeignKey,
  }

  if (isDateType(fieldType)) {
    return <DateFieldRenderer {...baseProps} />
  }

  if (fieldType === 'boolean') {
    return <BooleanFieldRenderer {...baseProps} />
  }

  if (fieldType.includes('uuid')) {
    return <UuidFieldRenderer {...baseProps} />
  }

  if (isNumericType(fieldType) && !fieldType.includes('[]')) {
    return <NumericFieldRenderer {...baseProps} />
  }

  if (isCustomEnum(column.data_type, enumValuesMap)) {
    return <EnumFieldRenderer {...baseProps} enumValuesMap={enumValuesMap} />
  }

  if (fieldType.includes('[]')) {
    return <ArrayFieldRenderer {...baseProps} />
  }

  if (isJsonType(fieldType) && !fieldType.includes('[]')) {
    return <JsonFieldRenderer {...baseProps} />
  }

  // Covers text, varchar, and fallback
  return <TextFieldRenderer {...baseProps} />
}
