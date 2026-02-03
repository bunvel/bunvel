import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useDatabaseEnums } from '@/hooks/queries/useEnums'
import { logger } from '@/lib/logger'
import type { ColumnDefinition, ForeignKeyDefinition } from '@/types'
import {
  DATA_TYPES,
  DEFAULT_COLUMN,
  PLACEHOLDERS,
  TABLE_FORM_MESSAGES,
} from '@/utils/constant'
import { Edit, Plus, Settings, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ForeignKeySheet } from './foreign-key-sheet'

interface TableFormSheetProps {
  schema: string
  children?: React.ReactNode
}

type FormValues = {
  name: string
  description: string
  columns: ColumnDefinition[]
  foreignKeys: ForeignKeyDefinition[]
}

export function TableFormSheet({ schema, children }: TableFormSheetProps) {
  const [open, setOpen] = useState(false)
  const [foreignKeySheetOpen, setForeignKeySheetOpen] = useState(false)
  const [editingForeignKey, setEditingForeignKey] = useState<
    ForeignKeyDefinition | undefined
  >()
  const { mutate: createTable, isPending: isSubmitting } = useCreateTable()
  const { data: enums = [] } = useDatabaseEnums(schema)

  const getDefaultColumns = () => [
    {
      name: 'id',
      type: 'bigint',
      nullable: false,
      isPrimaryKey: true,
      unique: false,
      defaultValue: undefined,
    },
    {
      name: 'created_at',
      type: 'timestamptz',
      nullable: false,
      isPrimaryKey: false,
      unique: false,
      defaultValue: 'now()',
    },
  ]

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

  // Combine built-in data types with custom enum types
  // Group enums by name to avoid duplicates
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

  // Validate foreign key type compatibility
  const validateForeignKeyTypes = async () => {
    const validForeignKeys = formValues.foreignKeys.filter(
      (fk) => fk.column && fk.referencedTable && fk.referencedColumn,
    )

    if (validForeignKeys.length === 0) return true

    for (const fk of validForeignKeys) {
      // Find the local column
      const localColumn = formValues.columns.find(
        (col) => col.name === fk.column,
      )
      if (!localColumn) continue

      try {
        // Use the editor service to get table metadata
        const { getTableMetadata } = await import('@/services/editor.service')
        const result = await getTableMetadata({
          data: { schema, table: fk.referencedTable },
        })
        const metadata = result?.data

        if (metadata) {
          const referencedColumn = metadata.columns?.find(
            (col: any) => col.column_name === fk.referencedColumn,
          )

          if (referencedColumn) {
            // Check if types are compatible
            const localType = localColumn.type.toLowerCase()
            const refType = referencedColumn.data_type.toLowerCase()

            // Basic type compatibility check
            const isCompatible =
              localType === refType ||
              (localType.includes('int') && refType.includes('int')) ||
              (localType.includes('varchar') && refType.includes('varchar')) ||
              (localType.includes('text') && refType.includes('text')) ||
              (localType.includes('char') && refType.includes('char')) ||
              (localType === 'uuid' && refType === 'uuid') ||
              (localType.includes('timestamp') && refType.includes('timestamp'))

            if (!isCompatible) {
              toast.error(TABLE_FORM_MESSAGES.FOREIGN_KEY_TYPE_MISMATCH, {
                description: TABLE_FORM_MESSAGES.TYPE_MISMATCH_TEMPLATE.replace(
                  '{column}',
                  fk.column,
                )
                  .replace('{localType}', localColumn.type)
                  .replace('{referencedColumn}', fk.referencedColumn)
                  .replace('{referencedType}', referencedColumn.data_type),
              })
              return false
            }
          }
        }
      } catch (error) {
        // If we can't validate types, let the backend handle it
        logger
          .component('table-form-sheet')
          .warn('Could not validate foreign key types', error)
      }
    }

    return true
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

    // Filter out empty column names and validate
    const validColumns = formValues.columns.filter(
      (col) => col.name.trim() !== '',
    )
    if (validColumns.length === 0) {
      toast.error('At least one column is required')
      return
    }

    // Validate column names
    const columnNames = validColumns.map((col) => col.name.toLowerCase())
    if (new Set(columnNames).size !== columnNames.length) {
      toast.error('Column names must be unique')
      return
    }

    // Validate foreign key types before submission
    const isTypesValid = await validateForeignKeyTypes()
    if (!isTypesValid) {
      return
    }

    // Filter out incomplete foreign keys
    const validForeignKeys = formValues.foreignKeys.filter(
      (fk) => fk.column && fk.referencedTable && fk.referencedColumn,
    )

    // Create table with columns and foreign keys
    createTable(
      {
        schema: schema,
        table: formValues.name,
        description: formValues.description,
        columns: validColumns,
        foreignKeys: validForeignKeys,
      },
      {
        onSuccess: () => {
          setOpen(false)
          resetForm()
        },
        onError: (error) => {
          logger
            .component('table-form-sheet')
            .error('Error creating table', error)

          // Extract meaningful error message
          let errorMessage = 'Failed to create table'
          let errorDescription = ''

          if (error instanceof Error) {
            errorMessage = error.message

            // Handle specific foreign key type mismatch error
            if (error.message.includes('incompatible types')) {
              errorMessage = 'Foreign key type mismatch'
              errorDescription =
                'The column types in the foreign key relationship are not compatible. Make sure both columns have the same data type.'
            } else if (error.message.includes('foreign key constraint')) {
              errorMessage = 'Foreign key constraint error'
              errorDescription =
                'There is an issue with the foreign key constraint. Please check the referenced table and column exist and have compatible types.'
            }
          }

          toast.error(errorMessage, {
            description:
              errorDescription ||
              'Please check your table configuration and try again.',
          })
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
            {/* Table Name Field */}
            <div className="p-6 space-y-6">
              <div className="flex">
                <Label htmlFor="table-name" className="w-48">
                  {TABLE_FORM_MESSAGES.TABLE_NAME}
                </Label>
                <Input
                  id="table-name"
                  name="name"
                  value={formValues.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={PLACEHOLDERS.TABLE_NAME}
                  required
                  pattern="[a-zA-Z_][a-zA-Z0-9_]*"
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex">
                <Label htmlFor="description" className="w-48">
                  {TABLE_FORM_MESSAGES.DESCRIPTION}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Separator />

            {/* Columns Section */}
            <div className="space-y-4 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  {TABLE_FORM_MESSAGES.TABLE_COLUMNS}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {TABLE_FORM_MESSAGES.DEFINE_TABLE_STRUCTURE}
                </p>
              </div>

              {/* Columns List */}
              <div className="space-y-4">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-2 pb-2 border-b">
                  <div className="col-span-4">
                    <Label className="text-sm font-medium">
                      {TABLE_FORM_MESSAGES.COLUMN_NAME}
                    </Label>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-sm font-medium">
                      {TABLE_FORM_MESSAGES.DATA_TYPE}
                    </Label>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-sm font-medium">
                      {TABLE_FORM_MESSAGES.DEFAULT}
                    </Label>
                  </div>
                  <div className="col-span-1 hidden">
                    <Label className="text-sm font-medium">Actions</Label>
                  </div>
                </div>

                {/* Column Rows */}
                <div className="space-y-4">
                  {formValues.columns.map((column, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      {/* Column Name */}
                      <div className="col-span-4">
                        <Input
                          value={column.name}
                          onChange={(e) =>
                            handleColumnChange(index, 'name', e.target.value)
                          }
                          placeholder={PLACEHOLDERS.COLUMN_NAME}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Data Type */}
                      <div className="col-span-3">
                        <Select
                          value={column.type}
                          onValueChange={(value) =>
                            handleColumnChange(index, 'type', value)
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="w-60">
                            {allDataTypes.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Default Value */}
                      <div className="col-span-3">
                        <Input
                          value={column.defaultValue || ''}
                          onChange={(e) =>
                            handleColumnChange(
                              index,
                              'defaultValue',
                              e.target.value,
                            )
                          }
                          placeholder={PLACEHOLDERS.OPTIONAL}
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center space-x-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 relative"
                              >
                                <HugeiconsIcon
                                  icon={Settings}
                                  className="h-4 w-4"
                                />
                                {(() => {
                                  const checkedCount = [
                                    column.isPrimaryKey,
                                    column.nullable,
                                    column.unique,
                                  ].filter(Boolean).length
                                  return checkedCount > 0 ? (
                                    <Badge
                                      variant="default"
                                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                                    >
                                      {checkedCount}
                                    </Badge>
                                  ) : null
                                })()}
                              </Button>
                            }
                          ></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuCheckboxItem
                              checked={column.isPrimaryKey}
                              onCheckedChange={(checked) =>
                                handleColumnChange(
                                  index,
                                  'isPrimaryKey',
                                  checked === true,
                                )
                              }
                            >
                              {TABLE_FORM_MESSAGES.PRIMARY_KEY}
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={column.nullable}
                              onCheckedChange={(checked) =>
                                handleColumnChange(
                                  index,
                                  'nullable',
                                  checked === true,
                                )
                              }
                              disabled={isSubmitting || column.isPrimaryKey}
                            >
                              {TABLE_FORM_MESSAGES.NULLABLE}
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={column.unique}
                              onCheckedChange={(checked) =>
                                handleColumnChange(
                                  index,
                                  'unique',
                                  checked === true,
                                )
                              }
                            >
                              {TABLE_FORM_MESSAGES.UNIQUE}
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 h-8 w-8 p-0"
                          onClick={() => {
                            const newColumns = [...formValues.columns]
                            newColumns.splice(index, 1)
                            setFormValues((prev) => ({
                              ...prev,
                              columns:
                                newColumns.length > 0
                                  ? newColumns
                                  : [{ ...DEFAULT_COLUMN }],
                            }))
                          }}
                          disabled={isSubmitting}
                        >
                          <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormValues((prev) => ({
                          ...prev,
                          columns: [...prev.columns, { ...DEFAULT_COLUMN }],
                        }))
                      }}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
                      {TABLE_FORM_MESSAGES.ADD_COLUMN}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Foreign Keys Section */}
            <div className="space-y-4 p-6 border-t">
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  {TABLE_FORM_MESSAGES.FOREIGN_KEYS}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {TABLE_FORM_MESSAGES.DEFINE_FOREIGN_KEYS}
                </p>
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
                          ADD Foreign key relation to: {schema}.
                          {fk.referencedTable}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {fk.column} → {schema}.{fk.referencedTable}.
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
                          disabled={isSubmitting}
                        >
                          <HugeiconsIcon icon={Edit} className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveForeignKey(fk)}
                          disabled={isSubmitting}
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
                  disabled={
                    formValues.columns.length === 0 ||
                    formValues.columns.every((col) => !col.name)
                  }
                  onClick={handleAddForeignKey}
                >
                  <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
                  {TABLE_FORM_MESSAGES.ADD_FOREIGN_KEY}
                </Button>
              </div>
            </div>
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
          onSave={handleForeignKeySave}
        />
      </SheetContent>
    </Sheet>
  )
}
