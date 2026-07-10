import { Button } from '@/components/ui/button'
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
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { DEFAULT_FOREIGN_KEY, FOREIGN_KEY_ACTIONS } from '@/constants/database'
import { TABLE_FORM_MESSAGES } from '@/constants/ui'
import { useSchemas } from '@/hooks/queries/useSchemas'
import { useTableMetadata } from '@/hooks/queries/useTableData'
import { useTables } from '@/hooks/queries/useTables'
import type {
  ColumnDefinition,
  ForeignKeyAction,
  ForeignKeyDefinition,
  Schema,
} from '@/types/database'
import { checkColumnTypeCompatibility } from '@/utils/validation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ForeignKeySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schema?: string
  tableName: string
  columns: Array<ColumnDefinition>
  existingForeignKey?: ForeignKeyDefinition
  onSave: (foreignKey: ForeignKeyDefinition) => void
}

// ReferencedColumnSelector component
interface ReferencedColumnSelectorProps {
  value: string
  onChange: (value: string | null) => void
  schema: string
  table: string
  disabled?: boolean
  localColumn?: ColumnDefinition
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

    // Handle case where localColumn.type might be an object
    let localType = ''
    if (localColumn.type !== null && localColumn.type !== undefined) {
      if (typeof localColumn.type === 'object') {
        localType = JSON.stringify(localColumn.type)
      } else {
        localType = String(localColumn.type)
      }
    }

    if (!localType) return { compatible: true, warning: '' }

    return checkColumnTypeCompatibility(localType, refColumnType)
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

export function ForeignKeySheet({
  open,
  onOpenChange,
  schema: initialSchema = 'public',
  tableName,
  columns,
  existingForeignKey,
  onSave,
}: ForeignKeySheetProps) {
  const [foreignKey, setForeignKey] = useState<ForeignKeyDefinition>(
    existingForeignKey || {
      ...DEFAULT_FOREIGN_KEY,
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  const [selectedSchema, setSelectedSchema] = useState<string>(
    existingForeignKey?.schema || initialSchema,
  )
  const { data: schemasData } = useSchemas()
  const schemas = schemasData?.data || []
  const { data: tables = [] } = useTables(selectedSchema)

  // Filter out tables that are being created in the current form to avoid self-reference
  const availableTables = tables.filter(
    (table) => table.name !== tableName && table.kind === 'TABLE',
  )

  // Update form when existingForeignKey changes
  useEffect(() => {
    if (existingForeignKey) {
      setForeignKey(existingForeignKey)
      setSelectedSchema(existingForeignKey.schema || initialSchema)
    } else {
      setForeignKey({
        ...DEFAULT_FOREIGN_KEY,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
      setSelectedSchema(initialSchema)
    }
  }, [existingForeignKey, initialSchema])

  const handleSave = () => {
    // Validate foreign key
    if (
      !foreignKey.column ||
      !foreignKey.referencedTable ||
      !foreignKey.referencedColumn
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    // Include the selected schema in the foreign key
    const foreignKeyWithSchema = {
      ...foreignKey,
      schema: selectedSchema,
    }

    onSave(foreignKeyWithSchema)
    onOpenChange(false)

    // Reset form if not editing
    if (!existingForeignKey) {
      setForeignKey({
        ...DEFAULT_FOREIGN_KEY,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
      setSelectedSchema(initialSchema)
    }
  }

  const handleFieldChange = (field: keyof ForeignKeyDefinition, value: any) => {
    setForeignKey((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSchemaChange = (schema: string | null) => {
    const newSchema = schema || 'public'
    setSelectedSchema(newSchema)
    // Reset referenced table and column when schema changes
    setForeignKey((prev) => ({
      ...prev,
      schema: newSchema,
      referencedTable: '',
      referencedColumn: '',
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-card min-w-lg flex flex-col">
        <form onSubmit={handleSave} className="flex flex-col h-full">
          <SheetHeader className="border-b p-4">
            <SheetTitle>
              {existingForeignKey ? 'Edit Foreign Key' : 'Add Foreign Key'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Schema Field */}
              <div className="flex">
                <Label htmlFor="schema" className="w-56">
                  Schema
                </Label>
                <Select
                  value={selectedSchema}
                  onValueChange={handleSchemaChange}
                  disabled={!!existingForeignKey}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select schema" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemas?.map((schema: Schema) => (
                      <SelectItem
                        key={schema.schema_name}
                        value={schema.schema_name}
                      >
                        {schema.schema_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Column Field */}
              <div className="flex">
                <Label htmlFor="column" className="w-56">
                  {TABLE_FORM_MESSAGES.COLUMN_NAME}
                </Label>
                <Select
                  value={foreignKey.column}
                  onValueChange={(value: string | null) => {
                    handleFieldChange('column', value)
                  }}
                  disabled={!!existingForeignKey}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={TABLE_FORM_MESSAGES.SELECT_COLUMN}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {columns
                      .filter((col) => col.name)
                      .map((column) => (
                        <SelectItem key={column.name} value={column.name}>
                          {column.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Referenced Table Field */}
              <div className="flex">
                <Label htmlFor="referenced-table" className="w-56">
                  {TABLE_FORM_MESSAGES.REFERENCED_TABLE}
                </Label>
                <Select
                  value={foreignKey.referencedTable}
                  onValueChange={(value: string | null) => {
                    handleFieldChange('referencedTable', value)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={TABLE_FORM_MESSAGES.SELECT_REFERENCED_TABLE}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((table) => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Referenced Column Field */}
              <div className="flex">
                <Label htmlFor="referenced-column" className="w-56">
                  {TABLE_FORM_MESSAGES.REFERENCED_COLUMN}
                </Label>
                <ReferencedColumnSelector
                  value={foreignKey.referencedColumn}
                  onChange={(value: string | null) => {
                    handleFieldChange('referencedColumn', value)
                  }}
                  schema={selectedSchema}
                  table={foreignKey.referencedTable}
                  disabled={!foreignKey.referencedTable}
                  localColumn={columns.find(
                    (col) => col.name === foreignKey.column,
                  )}
                />
              </div>

              {/* On Delete Action */}
              <div className="flex">
                <Label htmlFor="on-delete" className="w-56">
                  {TABLE_FORM_MESSAGES.ON_DELETE}
                </Label>
                <Select
                  value={foreignKey.onDelete}
                  onValueChange={(value: string | null) => {
                    handleFieldChange('onDelete', value as ForeignKeyAction)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOREIGN_KEY_ACTIONS.map((action: ForeignKeyAction) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* On Update Action */}
              <div className="flex">
                <Label htmlFor="on-update" className="w-56">
                  {TABLE_FORM_MESSAGES.ON_UPDATE}
                </Label>
                <Select
                  value={foreignKey.onUpdate}
                  onValueChange={(value: string | null) => {
                    handleFieldChange('onUpdate', value as ForeignKeyAction)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOREIGN_KEY_ACTIONS.map((action: ForeignKeyAction) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <SheetFooter className="p-4 border-t flex flex-row justify-end gap-2">
            <SheetClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="button" onClick={handleSave}>
              {existingForeignKey ? 'Update' : 'Add'} Foreign Key
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
