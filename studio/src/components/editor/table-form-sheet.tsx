import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCreateTable } from '@/hooks/mutations/useTableMutations'
import { useDataTypes } from '@/hooks/useDataTypes'
import { useForeignKeyManagement } from '@/hooks/useForeignKeyManagement'
import type { ColumnDefinition, ForeignKeyDefinition } from '@/types/database'
import { createEmptyColumn, getDefaultColumns } from '@/utils/column-defaults'
import { TABLE_FORM_MESSAGES } from '@/constants/ui'
import {
  handleTableFormError,
  showTableFormError,
} from '@/utils/error-handling'
import { validateForeignKeyTypes, validateTableForm } from '@/utils/validation'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { TableBasicInfo } from './TableBasicInfo'
import { TableColumnsSection } from './TableColumnsSection'
import { TableForeignKeysSection } from './TableForeignKeysSection'
import { ForeignKeySheet } from './foreign-key-sheet'

interface TableFormSheetProps {
  schema: string
  children?: React.ReactNode
}

type FormValues = {
  name: string
  description: string
  columns: Array<ColumnDefinition>
  foreignKeys: Array<ForeignKeyDefinition>
}

export function TableFormSheet({ schema, children }: TableFormSheetProps) {
  const [open, setOpen] = useState(false)
  const { mutate: createTable, isPending: isSubmitting } = useCreateTable()
  const { allDataTypes } = useDataTypes(schema)
  const {
    foreignKeySheetOpen,
    setForeignKeySheetOpen,
    editingForeignKey,
    handleForeignKeySave,
    handleEditForeignKey,
    handleAddForeignKey,
    handleRemoveForeignKey,
  } = useForeignKeyManagement()

  const resetForm = () => {
    setFormValues({
      name: '',
      description: '',
      columns: getDefaultColumns(),
      foreignKeys: [],
    })
  }

  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    description: '',
    columns: getDefaultColumns(),
    foreignKeys: [],
  })

  // Combine built-in data types with custom enum types is now handled by useDataTypes hook

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleColumnChange = (
    index: number,
    field: keyof ColumnDefinition,
    value: any,
  ) => {
    const newColumns = [...formValues.columns]

    // If setting primary key to true, ensure nullable is set to false
    if (field === 'isPrimaryKey' && value === true) {
      newColumns[index] = {
        ...newColumns[index],
        isPrimaryKey: true,
        nullable: false, // Primary keys cannot be nullable
      }
    } else {
      newColumns[index] = {
        ...newColumns[index],
        [field]: value,
      }
    }

    setFormValues((prev) => ({
      ...prev,
      columns: newColumns,
    }))
  }

  // Foreign key handlers are now handled by useForeignKeyManagement hook
  // Validation is now handled by utility functions

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()

    // Validate form using utility functions
    const validation = validateTableForm(
      formValues.columns,
      formValues.foreignKeys,
    )
    if (!validation.isValid) {
      return
    }

    // Validate foreign key types before submission
    const isTypesValid = await validateForeignKeyTypes(
      formValues.foreignKeys,
      formValues.columns,
      schema,
    )
    if (!isTypesValid) {
      return
    }

    // Create table with validated data
    createTable(
      {
        schema: schema,
        table: formValues.name,
        description: formValues.description,
        columns: validation.validColumns,
        foreignKeys: validation.validForeignKeys,
      },
      {
        onSuccess: () => {
          setOpen(false)
          resetForm()
        },
        onError: (error) => {
          const tableError = handleTableFormError(error)
          showTableFormError(tableError)
        },
      },
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
        render={<Button size={children ? 'sm' : 'icon'} variant="outline" />}
      >
        <HugeiconsIcon icon={Plus} className="h-4 w-4" />
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="bg-card min-w-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="border-b p-4">
            <SheetTitle>{TABLE_FORM_MESSAGES.CREATE_NEW_TABLE}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            {/* Table Basic Info */}
            <TableBasicInfo
              name={formValues.name}
              description={formValues.description}
              onInputChange={(field: string, value: string) =>
                handleInputChange(field as keyof FormValues, value)
              }
              disabled={isSubmitting}
            />
            <Separator />

            {/* Columns Section */}
            <TableColumnsSection
              columns={formValues.columns}
              allDataTypes={allDataTypes}
              onColumnChange={handleColumnChange}
              onAddColumn={() => {
                setFormValues((prev) => ({
                  ...prev,
                  columns: [...prev.columns, createEmptyColumn()],
                }))
              }}
              onDeleteColumn={(index: number) => {
                const newColumns = [...formValues.columns]
                newColumns.splice(index, 1)
                setFormValues((prev) => ({
                  ...prev,
                  columns:
                    newColumns.length > 0
                      ? newColumns
                      : [getDefaultColumns()[0]],
                }))
              }}
              disabled={isSubmitting}
            />

            {/* Foreign Keys Section */}
            <TableForeignKeysSection
              foreignKeys={formValues.foreignKeys}
              schema={schema}
              tableName={formValues.name}
              onAddForeignKey={handleAddForeignKey}
              onEditForeignKey={handleEditForeignKey}
              onRemoveForeignKey={(foreignKey: ForeignKeyDefinition) =>
                handleRemoveForeignKey(foreignKey, setFormValues)
              }
              disabled={isSubmitting}
            />
          </div>
          <SheetFooter className="p-4 border-t flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {TABLE_FORM_MESSAGES.CANCEL}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? TABLE_FORM_MESSAGES.CREATING
                : TABLE_FORM_MESSAGES.CREATE_TABLE}
            </Button>
          </SheetFooter>
        </form>

        {/* Foreign Key Sheet */}
        <ForeignKeySheet
          open={foreignKeySheetOpen}
          onOpenChange={setForeignKeySheetOpen}
          schema={schema}
          tableName={formValues.name}
          columns={formValues.columns}
          existingForeignKey={editingForeignKey}
          onSave={(foreignKey) =>
            handleForeignKeySave(foreignKey, setFormValues)
          }
        />
      </SheetContent>
    </Sheet>
  )
}
