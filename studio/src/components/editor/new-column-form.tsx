import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useAddColumn } from '@/hooks/mutations/useAddColumn'
import { useDatabaseEnums } from '@/hooks/queries/useEnums'
import type { ForeignKeyDefinition } from '@/types'
import { DATA_TYPES, PLACEHOLDERS } from '@/utils/constant'
import { Edit, Plus, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Field, FieldContent, FieldDescription, FieldLabel } from '../ui/field'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { ForeignKeySheet } from './foreign-key-sheet'

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
  foreignKeys: ForeignKeyDefinition[]
}

export function NewColumnForm({ schema, table }: NewColumnFormProps) {
  const [open, setOpen] = useState(false)
  const [foreignKeySheetOpen, setForeignKeySheetOpen] = useState(false)
  const [editingForeignKey, setEditingForeignKey] = useState<
    ForeignKeyDefinition | undefined
  >()
  const { data: enums = [] } = useDatabaseEnums(schema)
  const addColumnMutation = useAddColumn()

  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    description: '',
    type: 'text',
    isPrimaryKey: false,
    nullable: true,
    unique: false,
    foreignKeys: [],
  })

  // Combine built-in data types with custom enum types
  const uniqueEnums = enums.reduce((acc: any[], enum_: any) => {
    if (!acc.find((e: any) => e.enum_name === enum_.enum_name)) {
      acc.push(enum_)
    }
    return acc
  }, [])

  const allDataTypes = [
    ...DATA_TYPES,
    ...uniqueEnums.map((enum_: any) => ({
      value: enum_.enum_name,
      label: `${enum_.enum_name} (Custom Enum)`,
    })),
  ]

  const handleInputChange = (
    field: keyof FormValues,
    value: string | boolean | undefined,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleForeignKeySave = (foreignKey: ForeignKeyDefinition) => {
    if (editingForeignKey) {
      // Update existing foreign key
      setFormValues((prev) => ({
        ...prev,
        foreignKeys: prev.foreignKeys.map((fk) =>
          fk === editingForeignKey ? foreignKey : fk,
        ),
      }))
    } else {
      // Add new foreign key
      setFormValues((prev) => ({
        ...prev,
        foreignKeys: [...prev.foreignKeys, foreignKey],
      }))
    }
    setEditingForeignKey(undefined)
  }

  const handleEditForeignKey = (foreignKey: ForeignKeyDefinition) => {
    setEditingForeignKey(foreignKey)
    setForeignKeySheetOpen(true)
  }

  const handleAddForeignKey = () => {
    setEditingForeignKey(undefined)
    setForeignKeySheetOpen(true)
  }

  const handleRemoveForeignKey = (foreignKey: ForeignKeyDefinition) => {
    setFormValues((prev) => ({
      ...prev,
      foreignKeys: prev.foreignKeys.filter((fk) => fk !== foreignKey),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formValues.name.trim()) {
      toast.error('Column name is required')
      return
    }

    // Build the data type string with constraints
    let dataType = formValues.type

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
            type: 'text',
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
                  <Select
                    value={formValues.type}
                    onValueChange={(value) =>
                      value && handleInputChange('type', value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a column type..." />
                    </SelectTrigger>
                    <SelectContent className="w-60">
                      {allDataTypes.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="space-y-4 w-full">
                <Field orientation="horizontal">
                  <Switch
                    id="is-primary-key"
                    checked={formValues.isPrimaryKey}
                    onCheckedChange={(checked) =>
                      handleInputChange('isPrimaryKey', checked)
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="is-primary-key">
                      Is Primary Key
                    </FieldLabel>
                    <FieldDescription>
                      A primary key indicates that a column or group of columns
                      can be used as a unique identifier for rows in the table
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field orientation="horizontal">
                  <Switch
                    id="is-nullable"
                    checked={formValues.nullable}
                    onCheckedChange={(checked) =>
                      handleInputChange('nullable', checked)
                    }
                    disabled={formValues.isPrimaryKey}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="is-nullable">
                      Allow Nullable
                    </FieldLabel>
                    <FieldDescription>
                      Allow the column to assume a NULL value if no value is
                      provided
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field orientation="horizontal">
                  <Switch
                    id="is-unique"
                    checked={formValues.unique}
                    onCheckedChange={(checked) =>
                      handleInputChange('unique', checked)
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="is-unique">Is Unique</FieldLabel>
                    <FieldDescription>
                      Enforce values in the column to be unique across rows
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <div className="flex justify-between">
                    <FieldLabel htmlFor="check-constraint">
                      CHECK Constraint
                    </FieldLabel>
                    <FieldDescription>Optional</FieldDescription>
                  </div>
                  <Input
                    id="check-constraint"
                    name="checkConstraint"
                    placeholder={PLACEHOLDERS.CHECK_CONSTRAINT}
                    className="w-full"
                  />
                </Field>
              </div>
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
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Foreign key relation to: {schema}.{fk.referencedTable}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formValues.name} → {schema}.{fk.referencedTable}.
                          {fk.referencedColumn}
                        </p>
                        {(fk.onDelete !== 'NO ACTION' ||
                          fk.onUpdate !== 'NO ACTION') && (
                          <div className="flex gap-2 mt-2">
                            {fk.onDelete !== 'NO ACTION' && (
                              <Badge variant="secondary" className="text-xs">
                                ON DELETE: {fk.onDelete}
                              </Badge>
                            )}
                            {fk.onUpdate !== 'NO ACTION' && (
                              <Badge variant="secondary" className="text-xs">
                                ON UPDATE: {fk.onUpdate}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditForeignKey(fk)}
                        >
                          <HugeiconsIcon icon={Edit} className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveForeignKey(fk)}
                        >
                          <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Foreign Key Button */}
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
          onSave={handleForeignKeySave}
        />
      </SheetContent>
    </Sheet>
  )
}
