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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCreateTable } from '@/hooks/mutations/useTableMutations'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { useDatabaseEnums, useTables } from '@/hooks/queries/useTables'
import type {
  ColumnDefinition,
  ForeignKeyAction,
  ForeignKeyDefinition,
  Table,
} from '@/types'
import {
  DATA_TYPES,
  DEFAULT_COLUMN,
  DEFAULT_FOREIGN_KEY,
  FOREIGN_KEY_ACTIONS,
  PLACEHOLDERS,
  TABLE_FORM_MESSAGES,
} from '@/utils/constant'
import { Plus, Settings, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Separator } from '../ui/separator'

// ReferencedColumnSelector component
interface ReferencedColumnSelectorProps {
  value: string
  onChange: (value: string | null) => void
  schema: string
  table: string
  disabled?: boolean
  localColumn?: ColumnDefinition // Add local column for type checking
}

function ReferencedColumnSelector({
  value,
  onChange,
  schema,
  table,
  disabled,
  localColumn,
}: ReferencedColumnSelectorProps) {
  const { data: metadata } = useTableMetadata(schema, table)

  if (!table) {
    return (
      <Select disabled value="">
        <SelectTrigger className="w-full">
          <SelectValue placeholder={TABLE_FORM_MESSAGES.SELECT_TABLE_FIRST} />
        </SelectTrigger>
      </Select>
    )
  }

  const getColumnTypeCompatibility = (refColumnType: string) => {
    if (!localColumn) return { compatible: true, warning: '' }

    const localType = localColumn.type.toLowerCase()
    const refType = refColumnType.toLowerCase()

    const isCompatible =
      localType === refType ||
      (localType.includes('int') && refType.includes('int')) ||
      (localType.includes('varchar') && refType.includes('varchar')) ||
      (localType.includes('text') && refType.includes('text')) ||
      (localType.includes('char') && refType.includes('char')) ||
      (localType === 'uuid' && refType === 'uuid') ||
      (localType.includes('timestamp') && refType.includes('timestamp'))

    return {
      compatible: isCompatible,
      warning: isCompatible
        ? ''
        : `⚠️ Type mismatch: ${localColumn.type} → ${refColumnType}`,
    }
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={TABLE_FORM_MESSAGES.SELECT_COLUMN} />
      </SelectTrigger>
      <SelectContent>
        {metadata?.columns?.map((column) => {
          const compatibility = getColumnTypeCompatibility(column.data_type)
          return (
            <SelectItem
              key={column.column_name}
              value={column.column_name}
              disabled={!compatibility.compatible}
            >
              <div className="flex flex-col">
                <span>
                  {column.column_name} ({column.data_type})
                </span>
                {!compatibility.compatible && (
                  <span className="text-xs text-amber-600">
                    {compatibility.warning}
                  </span>
                )}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

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

export function TableFormSheet({ schema }: TableFormSheetProps) {
  const [open, setOpen] = useState(false)
  const { mutate: createTable, isPending: isSubmitting } = useCreateTable()
  const { data: tables = [] } = useTables(schema)
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

  // Filter out tables that are being created in the current form to avoid self-reference
  const availableTables = tables.filter(
    (table: Table) => table.name !== formValues.name && table.kind === 'TABLE',
  )

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
        console.warn('Could not validate foreign key types:', error)
      }
    }

    return true
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
          console.error('Error creating table:', error)

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
        render={
          <Button size="icon" variant="outline">
            <HugeiconsIcon icon={Plus} className="h-4 w-4" />
          </Button>
        }
      ></SheetTrigger>
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

              <div className="space-y-4">
                {/* Foreign Key Rows */}
                {formValues.foreignKeys.map((fk, fkIndex) => (
                  <div
                    key={fkIndex}
                    className="space-y-4 border p-4 rounded-md"
                  >
                    {/* First Row: Column | Ref Table | Ref Column */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {TABLE_FORM_MESSAGES.COLUMN_NAME}
                        </Label>
                        <Select
                          value={fk.column}
                          onValueChange={(value: string | null) => {
                            if (value === null) return
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.map((fk, i) =>
                                i === fkIndex ? { ...fk, column: value } : fk,
                              ),
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {fk.column || TABLE_FORM_MESSAGES.SELECT_COLUMN}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {formValues.columns.map((col) => (
                              <SelectItem key={col.name} value={col.name}>
                                {col.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {TABLE_FORM_MESSAGES.REFERENCED_TABLE}
                        </Label>
                        <Select
                          value={fk.referencedTable}
                          onValueChange={(value: string | null) => {
                            if (value === null) return
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.map((fk, i) =>
                                i === fkIndex
                                  ? {
                                      ...fk,
                                      referencedTable: value,
                                      referencedColumn: '',
                                    }
                                  : fk,
                              ),
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {fk.referencedTable ||
                                TABLE_FORM_MESSAGES.SELECT_REFERENCED_TABLE}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {availableTables.map((table: Table) => (
                              <SelectItem key={table.name} value={table.name}>
                                {table.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {TABLE_FORM_MESSAGES.REFERENCED_COLUMN}
                        </Label>
                        <ReferencedColumnSelector
                          value={fk.referencedColumn}
                          onChange={(value: string | null) => {
                            if (value === null) return
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.map((fk, i) =>
                                i === fkIndex
                                  ? { ...fk, referencedColumn: value }
                                  : fk,
                              ),
                            }))
                          }}
                          schema={schema}
                          table={fk.referencedTable}
                          disabled={isSubmitting || !fk.referencedTable}
                          localColumn={formValues.columns.find(
                            (col) => col.name === fk.column,
                          )}
                        />
                      </div>
                    </div>

                    {/* Second Row: On Delete | On Update | Remove Button */}
                    <div className="grid grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {TABLE_FORM_MESSAGES.ON_DELETE}
                        </Label>
                        <Select
                          value={fk.onDelete}
                          onValueChange={(value: ForeignKeyAction | null) => {
                            if (!value) return
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.map((fk, i) =>
                                i === fkIndex ? { ...fk, onDelete: value } : fk,
                              ),
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>{fk.onDelete}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {FOREIGN_KEY_ACTIONS.map((action) => (
                              <SelectItem
                                key={action.value}
                                value={action.value}
                              >
                                {action.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {TABLE_FORM_MESSAGES.ON_UPDATE}
                        </Label>
                        <Select
                          value={fk.onUpdate}
                          onValueChange={(value: ForeignKeyAction | null) => {
                            if (!value) return
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.map((fk, i) =>
                                i === fkIndex ? { ...fk, onUpdate: value } : fk,
                              ),
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>{fk.onUpdate}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {FOREIGN_KEY_ACTIONS.map((action) => (
                              <SelectItem
                                key={action.value}
                                value={action.value}
                              >
                                {action.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() =>
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.filter(
                                (_, i) => i !== fkIndex,
                              ),
                            }))
                          }
                          className="w-full"
                        >
                          <HugeiconsIcon
                            icon={Trash2}
                            className="h-4 w-4 mr-2"
                          />
                          {TABLE_FORM_MESSAGES.REMOVE}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  disabled={
                    formValues.columns.length === 0 ||
                    formValues.columns.every((col) => !col.name)
                  }
                  onClick={() =>
                    setFormValues((prev) => ({
                      ...prev,
                      foreignKeys: [
                        ...prev.foreignKeys,
                        { ...DEFAULT_FOREIGN_KEY },
                      ],
                    }))
                  }
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
      </SheetContent>
    </Sheet>
  )
}
