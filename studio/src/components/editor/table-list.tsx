import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTables } from '@/hooks/queries/useTables'
import { Table } from '@/services/schema.service'
import { EyeFreeIcons, TableIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate, useSearch } from '@tanstack/react-router'

interface SearchParams {
  schema?: string
  table?: string
}

export function TableList() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as SearchParams
  const { schema } = search
  const { data: tables = [], isLoading, error } = useTables(schema)
  const handleTableClick = (table: Table) => {
    navigate({
      search: {
        schema: table.table_schema,
        table: table.table_name,
      } as any, // Type assertion to handle search params
    })
  }

  if (!schema) {
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center">
        <HugeiconsIcon
          icon={TableIcon}
          className="mb-2 h-8 w-8 text-muted-foreground/50"
        />
        <p className="text-sm text-muted-foreground">
          Select a schema to view tables
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-1 w-full p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-full rounded-md border border-input px-3 flex items-center"
          >
            <Skeleton className="h-4 w-4 mr-3" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 space-y-2">
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
          <h4 className="mb-1 text-sm font-medium text-destructive">
            Error loading tables
          </h4>
          <p className="text-xs text-destructive/80">
            {error instanceof Error
              ? error.message
              : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    )
  }

  if (tables.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center">
        <HugeiconsIcon
          icon={TableIcon}
          className="mb-2 h-8 w-8 text-muted-foreground/50"
        />
        <p className="text-sm text-muted-foreground">
          No tables or views found in schema{' '}
          <span className="font-medium text-foreground">{schema}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-4">
      {tables.map((table) => {
        const isActive = search.table === table.table_name
        const isView = table.table_type === 'VIEW'

        return (
          <Button
            key={`${table.table_schema}.${table.table_name}`}
            variant={isActive ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={(e) => {
              e.preventDefault()
              handleTableClick(table)
            }}
          >
            {isView ? (
              <HugeiconsIcon
                icon={EyeFreeIcons}
                className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
              />
            ) : (
              <HugeiconsIcon
                icon={TableIcon}
                className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
              />
            )}
            <span className="truncate">{table.table_name}</span>
            {table.table_schema !== schema && (
              <span className="ml-2 truncate text-muted-foreground text-xs">
                {table.table_schema}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
