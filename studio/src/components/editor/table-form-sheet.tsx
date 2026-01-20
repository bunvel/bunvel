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
import type { ColumnDefinition as BaseColumnDefinition } from '@/services/table.service'
import {
  DATA_TYPES,
  DEFAULT_COLUMN,
  DEFAULT_FOREIGN_KEY,
  FOREIGN_KEY_ACTIONS,
  PLACEHOLDERS,
} from '@/utils/constant'
import { Plus, Settings, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Separator } from '../ui/separator'

type ColumnDefinition = BaseColumnDefinition & {
  isPrimaryKey?: boolean
  unique?: boolean
}

type ForeignKeyAction =
  | 'NO ACTION'
  | 'RESTRICT'
  | 'CASCADE'
  | 'SET NULL'
  | 'SET DEFAULT'

interface ForeignKeyDefinition {
  column: string
  referencedTable: string
  referencedColumn: string
  onDelete: ForeignKeyAction
  onUpdate: ForeignKeyAction
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
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
      // Filter out incomplete foreign keys
      const validForeignKeys = formValues.foreignKeys.filter(
        (fk) => fk.column && fk.referencedTable && fk.referencedColumn,
      )
      // Create table with columns and foreign keys
      createTable({
        schema: schema,
        table: formValues.name,
        description: formValues.description,
        columns: validColumns,
        foreignKeys: validForeignKeys,
      })
      setOpen(false)
    } catch (error) {
      console.error('Error creating table:', error)
      toast.error('Failed to create table', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      })
    }
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
            <SheetTitle>Create New Table</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            {/* Table Name Field */}
            <div className="p-6 space-y-6">
              <div className="flex">
                <Label htmlFor="table-name" className="w-48">
                  Table Name
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Separator />

            {/* Columns Section */}
            <div className="space-y-4 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Table Columns</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Define your table structure by adding columns
                </p>
              </div>

              {/* Columns List */}
              <div className="space-y-4">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-2 pb-2 border-b">
                  <div className="col-span-4">
                    <Label className="text-sm font-medium">Column Name</Label>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-sm font-medium">Data Type</Label>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-sm font-medium">Default</Label>
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
                          <SelectContent>
                            {DATA_TYPES.map(({ value, label }) => (
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
                                className="h-8 w-8 p-0"
                              >
                                <HugeiconsIcon
                                  icon={Settings}
                                  className="h-4 w-4"
                                />
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
                              Primary Key
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
                              Nullable
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
                              Unique
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
                      Add Column
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Foreign Keys Section */}
            <div className="space-y-4 p-6 border-t">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Foreign Keys</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Define relationships to other tables
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
                        <Label className="text-sm font-medium">Column</Label>
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
                              {fk.column || 'Select column'}
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
                          Referenced Table
                        </Label>
                        <Input
                          type="text"
                          value={fk.referencedTable}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.map((fk, i) =>
                                i === fkIndex
                                  ? { ...fk, referencedTable: e.target.value }
                                  : fk,
                              ),
                            }))
                          }
                          placeholder={PLACEHOLDERS.TABLE_NAME_FK}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          Referenced Column
                        </Label>
                        <Input
                          type="text"
                          value={fk.referencedColumn}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              foreignKeys: prev.foreignKeys.map((fk, i) =>
                                i === fkIndex
                                  ? { ...fk, referencedColumn: e.target.value }
                                  : fk,
                              ),
                            }))
                          }
                          placeholder={PLACEHOLDERS.COLUMN_NAME_FK}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Second Row: On Delete | On Update | Remove Button */}
                    <div className="grid grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">On Delete</Label>
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
                        <Label className="text-sm font-medium">On Update</Label>
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
                          Remove
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
                  Add Foreign Key
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Table'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
