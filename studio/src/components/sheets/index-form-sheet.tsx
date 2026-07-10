import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
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
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCreateIndex } from '@/hooks/mutations/useIndexMutations'
import { useSchemas } from '@/hooks/queries/useSchemas'
import {
  useDatabaseTableColumns,
  useDatabaseTables,
} from '@/hooks/queries/useTables'
import type { IndexType, Schema } from '@/types/database'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

interface IndexFormSheetProps {
  children?: React.ReactNode
}

type FormValues = {
  schema: string
  table: string
  columns: Array<string>
  unique: boolean
  indexType: IndexType
}

export function IndexFormSheet({ children }: IndexFormSheetProps) {
  const [open, setOpen] = useState(false)
  const { mutate: createIndex, isPending: isSubmitting } = useCreateIndex()
  const { data: schemasResult = { data: [] } } = useSchemas()
  const columnsAnchor = useComboboxAnchor()

  const indexTypes = [
    { label: 'B-tree', value: 'btree' },
    { label: 'Hash', value: 'hash' },
    { label: 'GiST', value: 'gist' },
    { label: 'SP-GiST', value: 'spgist' },
    { label: 'GIN', value: 'gin' },
    { label: 'BRIN', value: 'brin' },
  ]

  const [formData, setFormData] = useState<FormValues>({
    schema: 'public',
    table: '',
    columns: [],
    unique: false,
    indexType: 'btree',
  })

  const { data: tables = [], isLoading: isLoadingTables } = useDatabaseTables(
    formData.schema,
  )
  const selectedTableOid = tables.find((t) => t.name === formData.table)?.oid
  const { data: tableColumns = [], isLoading: isLoadingColumns } =
    useDatabaseTableColumns(selectedTableOid || '')

  // Create a lookup map for efficient column type access
  const columnTypeMap = new Map(
    tableColumns.map((col) => [col.name, col.data_type]),
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
    setFormData((prev) => ({
      ...prev,
      table: '',
      columns: [],
      unique: false,
      indexType: 'btree',
    }))
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
                  disabled={!formData.schema || isLoadingTables}
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
                    {isLoadingTables ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Loading tables...
                      </div>
                    ) : tables.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No tables found
                      </div>
                    ) : (
                      tables.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Multi-select Columns */}
              {formData.table && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Columns (max 32)
                  </label>
                  {isLoadingColumns ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Loading columns...
                    </div>
                  ) : tableColumns.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No columns found
                    </div>
                  ) : (
                    <Combobox
                      multiple
                      autoHighlight
                      items={tableColumns.map((col) => col.name)}
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
                        <ComboboxEmpty>No columns found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem
                              key={item}
                              value={item}
                              disabled={
                                formData.columns.length >= 32 &&
                                !formData.columns.includes(item)
                              }
                            >
                              <div className="flex flex-col">
                                <span>{item}</span>
                                <span className="text-xs text-muted-foreground">
                                  {columnTypeMap.get(item)}
                                </span>
                              </div>
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
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
                  items={indexTypes}
                  value={formData.indexType}
                  onValueChange={(value: any) =>
                    handleInputChange('indexType', value)
                  }
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select index type" />
                  </SelectTrigger>
                  <SelectContent>
                    {indexTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
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
          <SheetFooter className="border-t p-4 flex flex-row justify-end space-x-2">
            <SheetClose
              disabled={isSubmitting}
              render={<Button variant="outline">Cancel</Button>}
            />
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
