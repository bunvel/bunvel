import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTables } from '@/hooks/queries/useTables'
import { Table } from '@/services/table.service'
import {
  EyeFreeIcons,
  PropertyViewFreeIcons,
  TableIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Activity, useMemo, useState } from 'react'
import { Input } from '../ui/input'
import { TableFormSheet } from './table-form-sheet'
import { TableListAction } from './table-list-action'

interface SearchParams {
  schema?: string
  table?: string
}

export function TableList() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as SearchParams
  const { schema } = search
  const { data: tables = [], isLoading, error, refetch } = useTables(schema)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTables = useMemo(() => {
    if (!searchQuery) return tables
    const query = searchQuery.toLowerCase()
    return tables.filter((table) => table.name.toLowerCase().includes(query))
  }, [tables, searchQuery])

  const handleTableClick = (table: Table) => {
    navigate({
      search: {
        ...search,
        table: table.name,
      } as any,
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
      <div className="space-y-4 w-full p-4">
        <div className="flex gap-1">
          <div className="h-8 w-full rounded-md border border-input px-3 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="h-8 w-9 rounded-md border border-input flex items-center justify-center">
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-1">
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
            <Button variant="link" onClick={() => refetch()} className="ml-2">
              Retry
            </Button>
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
        <TableFormSheet
          schema={schema}
          children={
            <Button className="mt-2" size="sm" variant="outline">
              Create Table
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full p-4">
      <div className="flex gap-1">
        <Input
          placeholder="Search tables & views..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <TableFormSheet schema={schema} />
      </div>
      <div className="space-y-1">
        {filteredTables.length === 0 ? (
          <div
            key="no-results"
            className="py-4 text-center text-sm text-muted-foreground"
          >
            {searchQuery
              ? `No tables found matching "${searchQuery}"`
              : 'No tables found'}
          </div>
        ) : (
          filteredTables.map((table) => {
            const isActive = search.table === table.name
            const tableKey = `${table.name}`
            const isTable = table.kind === 'TABLE'
            const isView = table.kind === 'VIEW'
            const isMaterializedView = table.kind === 'MATERIALIZED VIEW'

            return (
              <div key={tableKey} className="group relative">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start group-hover:pr-8"
                  onClick={(e) => {
                    e.preventDefault()
                    handleTableClick(table)
                  }}
                >
                  <HugeiconsIcon
                    icon={
                      isView
                        ? EyeFreeIcons
                        : isMaterializedView
                          ? PropertyViewFreeIcons
                          : TableIcon
                    }
                    className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{table.name}</span>
                  <Activity mode={isTable ? 'visible' : 'hidden'}>
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100">
                      <TableListAction schema={schema} table={table.name} />
                    </div>
                  </Activity>
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
