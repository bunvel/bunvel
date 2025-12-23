import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import useDatabaseSchema from '@/hooks/useDatabaseSchema'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Database,
  Loader2,
  Table as TableIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SchemaListProps {
  onTableSelect: (schema: string, table: string) => void
  selectedTable?: { schema: string; table: string }
}

export const ExplorerSidebar = ({
  onTableSelect,
  selectedTable,
}: SchemaListProps) => {
  const { schemas, tables, isLoading, fetchTablesForSchema } =
    useDatabaseSchema()
  const [selectedSchema, setSelectedSchema] = useState<string>('public')
  const [isLoadingTables, setIsLoadingTables] = useState(false)

  // Load tables when selected schema changes
  useEffect(() => {
    const loadTables = async () => {
      if (selectedSchema && !tables[selectedSchema]) {
        setIsLoadingTables(true)
        try {
          await fetchTablesForSchema(selectedSchema)
        } finally {
          setIsLoadingTables(false)
        }
      }
    }
    loadTables()
  }, [selectedSchema, fetchTablesForSchema, tables])

  // Auto-select public schema if available and no schema is selected
  useEffect(() => {
    if (schemas.length > 0 && !selectedSchema) {
      const publicSchema =
        schemas.find((s) => s.schema_name === 'public') || schemas[0]
      if (publicSchema) {
        setSelectedSchema(publicSchema.schema_name)
      }
    }
  }, [schemas, selectedSchema])

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border sticky top-0 bg-sidebar z-10">
        <h2 className="text-sm font-semibold mb-2">Database Explorer</h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={isLoading || schemas.length === 0}
              >
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  {selectedSchema || 'Select schema...'}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {schemas.map((schema) => (
              <DropdownMenuItem
                key={schema.schema_name}
                onClick={() => setSelectedSchema(schema.schema_name)}
                className={cn(
                  'cursor-pointer',
                  selectedSchema === schema.schema_name && 'bg-accent',
                )}
              >
                {schema.schema_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2 px-1">
          {isLoadingTables ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                Loading tables...
              </span>
            </div>
          ) : selectedSchema && tables[selectedSchema]?.length > 0 ? (
            tables[selectedSchema].map((table) => (
              <Button
                key={`${selectedSchema}.${table.table_name}`}
                onClick={() => onTableSelect(selectedSchema, table.table_name)}
                variant={selectedTable?.schema === selectedSchema && selectedTable?.table === table.table_name ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  selectedTable?.schema === selectedSchema && selectedTable?.table === table.table_name && 'font-medium'
                )}
              >
                <TableIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span className="truncate">{table.table_name}</span>
              </Button>
            ))
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                {selectedSchema ? 'No tables found' : 'Select a schema'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default ExplorerSidebar
