import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCreateIndex } from '@/hooks/mutations/useIndexMutations'
import { useSchemas } from '@/hooks/queries/useSchemas'
import {
  useDatabaseTableColumns,
  useDatabaseTables,
} from '@/hooks/queries/useTables'
import { DatabaseTableColumns, Schema } from '@/types/database'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface IndexFormSheetProps {
  children?: React.ReactNode
}

type FormValues = {
  schema: string
  table: string
  columns: string[]
  unique: boolean
  indexType: 'btree' | 'hash' | 'gist' | 'spgist' | 'gin' | 'brin'
}

export function IndexFormSheet({ children }: IndexFormSheetProps) {
  const [open, setOpen] = useState(false)
  const { mutate: createIndex, isPending: isSubmitting } = useCreateIndex()
  const { data: schemasResult = { data: [] } } = useSchemas()
  const columnsAnchor = useComboboxAnchor()

  const [formData, setFormData] = useState<FormValues>({
    schema: 'public',
    table: '',
    columns: [],
    unique: false,
    indexType: 'btree',
  })

  const { data: tables = [] } = useDatabaseTables(formData.schema)
  const selectedTableOid = tables.find((t) => t.name === formData.table)?.oid
  const { data: tableColumns = [] } = useDatabaseTableColumns(
    selectedTableOid || '',
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.schema || !formData.table || formData.columns.length === 0) {
      return
    }

    createIndex({
      schema: formData.schema,
      table: formData.table,
      columns: formData.columns,
      unique: formData.unique,
      indexType: formData.indexType,
    })

    setOpen(false)
    setFormData({
      schema: '',
      table: '',
      columns: [],
      unique: false,
      indexType: 'btree',
    })
  }

  const handleInputChange = (field: keyof FormValues, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateIndexPreview = () => {
    if (formData.columns.length === 0 || !formData.schema || !formData.table)
      return ''

    const uniqueClause = formData.unique ? 'UNIQUE ' : ''
    const columnsList = formData.columns.map((col) => `"${col}"`).join(', ')
    return `CREATE ${uniqueClause}INDEX ON "${formData.schema}"."${formData.table}" USING ${formData.indexType} (${columnsList})`
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button size={children ? 'sm' : 'icon'} variant="outline" />}
      >
        <HugeiconsIcon icon={Plus} className="h-4 w-4" />
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="bg-card min-w-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Create a new index</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Schema Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Schema</label>
                <Select
                  value={formData.schema}
                  onValueChange={(value) => {
                    handleInputChange('schema', value)
                    handleInputChange('table', '') // Reset table when schema changes
                  }}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select a schema" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemasResult.data.map((schema: Schema) => (
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

              {/* Table Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Table</label>
                <Select
                  value={formData.table}
                  onValueChange={(value) => handleInputChange('table', value)}
                  disabled={!formData.schema}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue
                      placeholder={
                        formData.schema
                          ? 'Select a table'
                          : 'Select schema first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Multi-select Columns */}
              {formData.table && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Columns (max 32)
                  </label>
                  <Combobox
                    multiple
                    value={formData.columns}
                    onValueChange={(value) =>
                      handleInputChange('columns', value)
                    }
                  >
                    <ComboboxChips ref={columnsAnchor} className="w-full">
                      <ComboboxValue>
                        {(values) => (
                          <>
                            {values.map((value: string) => (
                              <ComboboxChip key={value}>{value}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput
                              placeholder="Select columns..."
                              disabled={formData.columns.length >= 32}
                            />
                          </>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={columnsAnchor}>
                      <ComboboxList>
                        {tableColumns.map((column: DatabaseTableColumns) => (
                          <ComboboxItem
                            key={column.name}
                            value={column.name}
                            disabled={
                              formData.columns.length >= 32 &&
                              !formData.columns.includes(column.name)
                            }
                          >
                            <div className="flex flex-col">
                              <span>{column.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {column.data_type}
                              </span>
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {formData.columns.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.columns.length} of 32 columns selected
                    </p>
                  )}
                </div>
              )}

              {/* Unique Index */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="unique"
                  checked={formData.unique}
                  onChange={(e) =>
                    handleInputChange('unique', e.target.checked)
                  }
                  className="h-4 w-4 rounded border border-input text-primary focus:ring-primary"
                />
                <label htmlFor="unique" className="text-sm font-medium">
                  Unique Index
                </label>
              </div>

              {/* Index Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Index Type</label>
                <Select
                  value={formData.indexType}
                  onValueChange={(value: any) =>
                    handleInputChange('indexType', value)
                  }
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select index type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btree">B-tree</SelectItem>
                    <SelectItem value="hash">Hash</SelectItem>
                    <SelectItem value="gist">GiST</SelectItem>
                    <SelectItem value="spgist">SP-GiST</SelectItem>
                    <SelectItem value="gin">GIN</SelectItem>
                    <SelectItem value="brin">BRIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {formData.columns.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview</label>
                  <div className="p-3 bg-muted rounded-md">
                    <code className="text-xs text-muted-foreground break-all">
                      {generateIndexPreview()}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t p-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.schema ||
                !formData.table ||
                formData.columns.length === 0
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Index'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
