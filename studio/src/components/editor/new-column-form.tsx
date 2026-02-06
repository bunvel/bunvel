import { DataTypeSelector } from '@/components/common/data-type-selector'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAddColumn } from '@/hooks/mutations/useAddColumn'
import { useDataTypes } from '@/hooks/useDataTypes'
import { useForeignKeyManagement } from '@/hooks/useForeignKeyManagement'
import type { ForeignKeyDefinition } from '@/types/database'
import { PLACEHOLDERS } from '@/constants/ui'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ColumnConstraints } from './ColumnConstraints'
import { ForeignKeySheet } from './foreign-key-sheet'
import { ForeignKeyCard } from './ForeignKeyCard'

interface NewColumnFormProps {
  schema: string
  table: string
}

type FormValues = {
  name: string
  description: string
  type: string
  defaultValue?: string
  isPrimaryKey: boolean
  nullable: boolean
  unique: boolean
  foreignKeys: Array<ForeignKeyDefinition>
}

export function NewColumnForm({ schema, table }: NewColumnFormProps) {
  const [open, setOpen] = useState(false)
  const { allDataTypes } = useDataTypes(schema)
  const addColumnMutation = useAddColumn()
  const {
    foreignKeySheetOpen,
    setForeignKeySheetOpen,
    editingForeignKey,
    handleForeignKeySave,
    handleEditForeignKey,
    handleAddForeignKey,
    handleRemoveForeignKey,
  } = useForeignKeyManagement()

  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    description: '',
    type: 'TEXT',
    isPrimaryKey: false,
    nullable: true,
    unique: false,
    foreignKeys: [],
  })

  // Enum processing and foreign key handlers are now handled by shared hooks

  const handleInputChange = (
    field: keyof FormValues,
    value: string | boolean | undefined,
  ) => {
    setFormValues((prev) => {
      const newValues = {
        ...prev,
        [field]: value,
      }

      // If primary key is set to true, automatically set nullable to false
      if (field === 'isPrimaryKey' && value === true) {
        newValues.nullable = false
      }

      return newValues
    })
  }

  // Foreign key handlers are now handled by useForeignKeyManagement hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formValues.name.trim()) {
      toast.error('Column name is required')
      return
    }

    // Build the data type string with constraints
    let dataType = formValues.type

    // Ensure dataType is a string (handle case where it might be an object)
    if (typeof dataType !== 'string') {
      if (dataType && typeof dataType === 'object' && 'value' in dataType) {
        // If it's an object with a value property, use that
        dataType = (dataType as any).value || JSON.stringify(dataType)
      } else {
        dataType = String(dataType || 'TEXT')
      }
    }

    // Add NOT NULL constraint if not nullable
    if (!formValues.nullable) {
      dataType += ' NOT NULL'
    }

    // Add UNIQUE constraint if unique
    if (formValues.unique) {
      dataType += ' UNIQUE'
    }

    // Add PRIMARY KEY constraint if primary key
    if (formValues.isPrimaryKey) {
      dataType += ' PRIMARY KEY'
    }

    // Filter out incomplete foreign keys
    const validForeignKeys = formValues.foreignKeys.filter(
      (fk) => fk.column && fk.referencedTable && fk.referencedColumn,
    )

    // Call the addColumn mutation
    addColumnMutation.mutate({
      schema,
      table,
      column: formValues.name,
      dataType,
      foreignKeys: validForeignKeys,
      onSuccess: () => setOpen(false),
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (newOpen) {
          // Reset form when opening
          setFormValues({
            name: '',
            description: '',
            type: 'TEXT',
            isPrimaryKey: false,
            nullable: true,
            unique: false,
            foreignKeys: [],
          })
        }
      }}
    >
      <SheetTrigger
        render={<Button size="icon-xs" variant="ghost" className="w-full" />}
      >
        <HugeiconsIcon icon={Plus} className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side="right" className="bg-card min-w-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Add New Column to {table}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            {/* General Section */}
            <div className="p-6 space-y-6">
              <div className="flex">
                <Label htmlFor="column-name" className="w-48">
                  Name
                </Label>
                <Input
                  id="column-name"
                  name="name"
                  value={formValues.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter column name"
                  required
                  pattern="[a-zA-Z_][a-zA-Z0-9_]*"
                  className="w-full"
                />
              </div>
              <div className="flex">
                <Label htmlFor="description" className="w-48">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formValues.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder={PLACEHOLDERS.OPTIONAL}
                  className="w-full"
                />
              </div>
            </div>
            <Separator />

            {/* Data Type Section */}
            <div className="flex p-6">
              <div className="w-48">
                <Label>Data Type</Label>
              </div>

              <div className="space-y-4 w-full">
                <Field>
                  <FieldLabel htmlFor="type">Type</FieldLabel>
                  <DataTypeSelector
                    value={formValues.type}
                    onChange={(value) =>
                      value && handleInputChange('type', value)
                    }
                    dataTypes={allDataTypes}
                    disabled={addColumnMutation.isPending}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="default-value">Default Value</FieldLabel>
                  <Input
                    id="default-value"
                    name="defaultValue"
                    value={formValues.defaultValue || ''}
                    onChange={(e) =>
                      handleInputChange('defaultValue', e.target.value)
                    }
                    placeholder={PLACEHOLDERS.OPTIONAL}
                    className="w-full"
                  />
                </Field>
              </div>
            </div>
            <Separator />

            {/* Constraints Section */}
            <div className="flex p-6">
              <div className="w-48">
                <Label>Constraints</Label>
              </div>

              <ColumnConstraints
                column={{
                  isPrimaryKey: formValues.isPrimaryKey,
                  nullable: formValues.nullable,
                  unique: formValues.unique,
                }}
                onChange={(field: string, value: boolean | undefined) =>
                  handleInputChange(field as keyof FormValues, value)
                }
                disabled={addColumnMutation.isPending}
              />
            </div>
            <Separator />

            {/* Foreign Keys Section */}
            <div className="space-y-4 p-6 border-t">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Foreign Keys</h3>
              </div>

              {/* Foreign Key Cards */}
              <div className="space-y-3">
                {formValues.foreignKeys.map((fk, index) => (
                  <ForeignKeyCard
                    key={index}
                    foreignKey={fk}
                    schema={schema}
                    columnName={formValues.name}
                    onEdit={handleEditForeignKey}
                    onRemove={(foreignKey) =>
                      handleRemoveForeignKey(foreignKey, setFormValues)
                    }
                  />
                ))}

                {/* Add Foreign Key Button - Only show when no foreign keys exist */}
                {formValues.foreignKeys.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    disabled={!formValues.name}
                    onClick={handleAddForeignKey}
                  >
                    <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
                    Add foreign key
                  </Button>
                )}
              </div>
            </div>
          </div>
          <SheetFooter className="p-4 border-t flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addColumnMutation.isPending}>
              {addColumnMutation.isPending ? 'Adding...' : 'Add Column'}
            </Button>
          </SheetFooter>
        </form>

        {/* Foreign Key Sheet */}
        <ForeignKeySheet
          open={foreignKeySheetOpen}
          onOpenChange={setForeignKeySheetOpen}
          schema={schema}
          tableName={table}
          columns={[
            {
              name: formValues.name,
              type: formValues.type,
              nullable: formValues.nullable,
              isPrimaryKey: formValues.isPrimaryKey,
              unique: formValues.unique,
              defaultValue: formValues.defaultValue || undefined,
            },
          ]}
          existingForeignKey={editingForeignKey}
          onSave={(foreignKey) =>
            handleForeignKeySave(foreignKey, setFormValues)
          }
        />
      </SheetContent>
    </Sheet>
  )
}
