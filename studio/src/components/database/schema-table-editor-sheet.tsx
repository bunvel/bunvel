import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useDataTypes } from '@/hooks/useDataTypes'
import { logWideEvent } from '@/lib/logger'
import type { TableNode } from '@/services/schema-diagram.service'
import { Plus, Trash } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SchemaTableEditorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schema: string
  tableNode: TableNode | null
  onSave: () => void
}

interface EditableColumn {
  id: string // Unique identifier for local state tracking
  name: string
  dataType: string
  isNullable: boolean
  isPrimaryKey: boolean
  isForeignKey: boolean
  // Flags to track modifications
  isNew: boolean
  isDeleted: boolean
  originalName: string // To detect column renaming
  originalDataType: string
  originalIsNullable: boolean
}

export function SchemaTableEditorSheet({
  open,
  onOpenChange,
  schema,
  tableNode,
  onSave,
}: SchemaTableEditorSheetProps) {
  const { allDataTypes } = useDataTypes(schema)
  const executeSqlMutation = useExecuteSqlQuery()

  // Local state for columns
  const [columns, setColumns] = useState<Array<EditableColumn>>([])

  // State for new column form
  const [newColName, setNewColName] = useState('')
  const [newColType, setNewColType] = useState('VARCHAR')
  const [newColNullable, setNewColNullable] = useState(true)

  // Initialize state when tableNode changes or sheet opens
  useEffect(() => {
    if (open && tableNode) {
      const initialCols = tableNode.columns.map((col, idx) => ({
        id: `existing-${idx}-${col.name}`,
        name: col.name,
        dataType: col.dataType,
        isNullable: col.isNullable,
        isPrimaryKey: col.isPrimaryKey,
        isForeignKey: col.isForeignKey,
        isNew: false,
        isDeleted: false,
        originalName: col.name,
        originalDataType: col.dataType,
        originalIsNullable: col.isNullable,
      }))
      setColumns(initialCols)
      setNewColName('')
      setNewColType('VARCHAR')
      setNewColNullable(true)
    }
  }, [open, tableNode])

  if (!tableNode) return null

  // Add column handler
  const handleAddColumn = () => {
    const name = newColName.trim()
    if (!name) {
      toast.error('Column name is required')
      return
    }

    // Check if name is unique
    const nameExists = columns.some(
      (col) => !col.isDeleted && col.name.toLowerCase() === name.toLowerCase(),
    )
    if (nameExists) {
      toast.error(`Column "${name}" already exists`)
      return
    }

    const newCol: EditableColumn = {
      id: `new-${Date.now()}-${name}`,
      name,
      dataType: newColType,
      isNullable: newColNullable,
      isPrimaryKey: false,
      isForeignKey: false,
      isNew: true,
      isDeleted: false,
      originalName: name,
      originalDataType: newColType,
      originalIsNullable: newColNullable,
    }

    setColumns((prev) => [...prev, newCol])
    setNewColName('')
    setNewColNullable(true)
  }

  // Update existing column handler
  const handleUpdateColumn = (id: string, updates: Partial<EditableColumn>) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== id) return col
        return { ...col, ...updates }
      }),
    )
  }

  // Handle saving the table changes
  const handleSave = () => {
    const tableName = tableNode.name
    const sqlStatements: Array<string> = []

    columns.forEach((col) => {
      const escapedTable = `"${schema}"."${tableName}"`
      const escapedCol = `"${col.name}"`
      const escapedOrigCol = `"${col.originalName}"`

      if (col.isNew) {
        if (!col.isDeleted) {
          // ADD COLUMN
          const nullability = col.isNullable ? 'NULL' : 'NOT NULL'
          sqlStatements.push(
            `ALTER TABLE ${escapedTable} ADD COLUMN ${escapedCol} ${col.dataType.toUpperCase()} ${nullability};`,
          )
        }
      } else {
        if (col.isDeleted) {
          // DROP COLUMN
          sqlStatements.push(
            `ALTER TABLE ${escapedTable} DROP COLUMN ${escapedOrigCol};`,
          )
        } else {
          // RENAME COLUMN
          if (col.name !== col.originalName) {
            sqlStatements.push(
              `ALTER TABLE ${escapedTable} RENAME COLUMN ${escapedOrigCol} TO ${escapedCol};`,
            )
          }
          // TYPE CHANGE
          if (col.dataType !== col.originalDataType) {
            const baseType = col.dataType.toUpperCase()
            sqlStatements.push(
              `ALTER TABLE ${escapedTable} ALTER COLUMN ${escapedCol} TYPE ${baseType} USING ${escapedCol}::${baseType};`,
            )
          }
          // NULLABILITY CHANGE
          if (col.isNullable !== col.originalIsNullable) {
            if (col.isNullable) {
              sqlStatements.push(
                `ALTER TABLE ${escapedTable} ALTER COLUMN ${escapedCol} DROP NOT NULL;`,
              )
            } else {
              sqlStatements.push(
                `ALTER TABLE ${escapedTable} ALTER COLUMN ${escapedCol} SET NOT NULL;`,
              )
            }
          }
        }
      }
    })

    if (sqlStatements.length === 0) {
      toast.info('No changes detected')
      onOpenChange(false)
      return
    }

    const transactionSql = `BEGIN;\n${sqlStatements.join('\n')}\nCOMMIT;`

    executeSqlMutation.mutate(transactionSql, {
      onSuccess: () => {
        toast.success(`Successfully updated table schema "${tableName}"`)
        onSave()
        onOpenChange(false)
      },
      onError: (error) => {
        logWideEvent('schema.designer.alter.error', {
          schema,
          tableName,
          error,
        })
        toast.error('Failed to update table schema', {
          description:
            error instanceof Error ? error.message : 'Unknown database error',
        })
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-card min-w-[650px] flex flex-col p-0"
      >
        <SheetHeader className="border-b p-4 px-6 shrink-0">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <span>Edit Table Schema:</span>
            <span className="text-primary font-mono">{tableNode.name}</span>
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Columns List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Columns
            </h3>
            <div className="border rounded-lg overflow-hidden divide-y bg-background">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/40 font-medium text-xs text-muted-foreground">
                <div className="col-span-5">Name</div>
                <div className="col-span-4">Type</div>
                <div className="col-span-2 text-center">Nullable</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              {columns.map((col) => (
                <div
                  key={col.id}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                    col.isDeleted
                      ? 'bg-destructive/5 opacity-60 line-through'
                      : 'hover:bg-muted/10'
                  }`}
                >
                  {/* Column Name */}
                  <div className="col-span-5">
                    <Input
                      value={col.name}
                      onChange={(e) =>
                        handleUpdateColumn(col.id, { name: e.target.value })
                      }
                      disabled={
                        col.isDeleted ||
                        col.isPrimaryKey ||
                        executeSqlMutation.isPending
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>

                  {/* Column Type */}
                  <div className="col-span-4">
                    <Select
                      value={col.dataType}
                      onValueChange={(val) =>
                        handleUpdateColumn(col.id, {
                          dataType: val || 'VARCHAR',
                        })
                      }
                      disabled={
                        col.isDeleted ||
                        col.isPrimaryKey ||
                        executeSqlMutation.isPending
                      }
                    >
                      <SelectTrigger className="h-8 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allDataTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="text-xs font-mono"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nullable */}
                  <div className="col-span-2 flex justify-center">
                    <Checkbox
                      checked={col.isNullable}
                      onCheckedChange={(checked) =>
                        handleUpdateColumn(col.id, { isNullable: !!checked })
                      }
                      disabled={
                        col.isDeleted ||
                        col.isPrimaryKey ||
                        executeSqlMutation.isPending
                      }
                      className="h-4 w-4"
                    />
                  </div>

                  {/* Delete Action */}
                  <div className="col-span-1 flex justify-end">
                    {col.isPrimaryKey ? (
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-1.5 py-0.5 rounded">
                        PK
                      </span>
                    ) : col.isDeleted ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          handleUpdateColumn(col.id, { isDeleted: false })
                        }
                        disabled={executeSqlMutation.isPending}
                        className="text-xs text-primary hover:underline p-0 h-auto"
                      >
                        Undo
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (col.isNew) {
                            setColumns((prev) =>
                              prev.filter((c) => c.id !== col.id),
                            )
                          } else {
                            handleUpdateColumn(col.id, { isDeleted: true })
                          }
                        }}
                        disabled={executeSqlMutation.isPending}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                      >
                        <HugeiconsIcon icon={Trash} className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {columns.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No columns defined.
                </div>
              )}
            </div>
          </div>

          {/* Add Column Section */}
          <div className="border rounded-xl p-5 bg-muted/20 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Add New Column
            </h4>
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5 flex flex-col gap-1.5">
                <Label htmlFor="new-col-name" className="text-xs">
                  Column Name
                </Label>
                <Input
                  id="new-col-name"
                  placeholder="e.g. email"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  disabled={executeSqlMutation.isPending}
                  className="h-8 text-xs font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddColumn()
                    }
                  }}
                />
              </div>

              <div className="col-span-4 flex flex-col gap-1.5">
                <Label className="text-xs">Data Type</Label>
                <Select
                  value={newColType}
                  onValueChange={(val) => setNewColType(val || 'VARCHAR')}
                  disabled={executeSqlMutation.isPending}
                >
                  <SelectTrigger className="h-8 text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allDataTypes.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="text-xs font-mono"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 flex flex-col items-center gap-2 pb-1.5">
                <Label className="text-xs">Nullable</Label>
                <Checkbox
                  checked={newColNullable}
                  onCheckedChange={(checked) => setNewColNullable(!!checked)}
                  disabled={executeSqlMutation.isPending}
                  className="h-4 w-4"
                />
              </div>

              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  size="icon"
                  onClick={handleAddColumn}
                  disabled={executeSqlMutation.isPending || !newColName.trim()}
                  className="h-8 w-8 shrink-0"
                >
                  <HugeiconsIcon icon={Plus} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t p-4 px-6 flex flex-row justify-end gap-3 shrink-0">
          <SheetClose
            render={
              <Button variant="outline" disabled={executeSqlMutation.isPending}>
                Cancel
              </Button>
            }
          />
          <Button
            type="button"
            onClick={handleSave}
            disabled={executeSqlMutation.isPending}
          >
            {executeSqlMutation.isPending ? 'Saving...' : 'Save Schema'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
