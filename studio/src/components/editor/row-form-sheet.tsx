import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useDatabaseEnums } from '@/hooks/queries/useEnums'
import { useRowForm } from '@/hooks/useRowForm'
import type { DatabaseEnum } from '@/types/database'
import type { ColumnMetadata } from '@/types/table'
import { BUTTON_LABELS } from '@/constants/ui'
import { Edit, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import React, { useCallback, useMemo, useState } from 'react'
import { FieldSection } from './FieldSection'
import { ReferenceSelectorSheet } from './reference-selector-sheet'

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

  const { data: enums = [] } = useDatabaseEnums(schema)

  const {
    formValues,
    handleInputChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    metadata,
  } = useRowForm({ schema, table, mode, initialData })

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

  const enumValuesMap = useMemo(() => {
    const grouped: Record<string, Array<string>> = {}
    enums.forEach((item: DatabaseEnum) => {
      if (!grouped[item.enum_name]) {
        grouped[item.enum_name] = []
      }
      grouped[item.enum_name].push(item.enum_value)
    })
    return grouped
  }, [enums])

  const handleFormSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    handleSubmit(() => {
      setOpen(false)
    })
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
        <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
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
                <FieldSection
                  title="Primary Key"
                  columns={fieldGroups.primaryKey}
                  formValues={formValues}
                  isSubmitting={isSubmitting}
                  mode={mode}
                  enumValuesMap={enumValuesMap}
                  onChange={handleInputChange}
                  onReferenceSelectorOpen={handleReferenceSelectorOpen}
                />
                <FieldSection
                  title="Required Fields"
                  columns={fieldGroups.required}
                  formValues={formValues}
                  isSubmitting={isSubmitting}
                  mode={mode}
                  enumValuesMap={enumValuesMap}
                  onChange={handleInputChange}
                  onReferenceSelectorOpen={handleReferenceSelectorOpen}
                  hasPrimaryKey={fieldGroups.primaryKey.length > 0}
                />
                <FieldSection
                  title="Optional Fields"
                  columns={fieldGroups.optional}
                  formValues={formValues}
                  isSubmitting={isSubmitting}
                  mode={mode}
                  enumValuesMap={enumValuesMap}
                  onChange={handleInputChange}
                  onReferenceSelectorOpen={handleReferenceSelectorOpen}
                  isOptional={true}
                  hasPrimaryKey={fieldGroups.primaryKey.length > 0}
                  hasRequired={fieldGroups.required.length > 0}
                />
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
