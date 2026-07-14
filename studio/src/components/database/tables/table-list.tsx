import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { TableKindIcon } from '@/components/common/table-kind-icon'
import { TableFormSheet } from '@/components/sheets/table-form-sheet'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { PLACEHOLDERS } from '@/constants/ui'
import { useTables } from '@/hooks/queries/useTables'
import { isRestrictedSchema } from '@/lib/restricated-schema'
import type { Table } from '@/types/database'
import { TableIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { TableListAction } from './table-list-action'

export function TableList() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as {
    schema?: string
    table?: string
  }
  const { schema } = search
  const { data: tables = [], isLoading, error, refetch } = useTables(schema)
  const [searchQuery, setSearchQuery] = useState('')
  const isRestricted = isRestrictedSchema(schema)

  const filteredTables = !searchQuery
    ? tables
    : tables.filter((table) =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

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
      <Empty className="h-full flex-1 rounded-none border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={TableIcon} />
          </EmptyMedia>
          <EmptyTitle>No schema selected</EmptyTitle>
          <EmptyDescription>Select a schema to view tables</EmptyDescription>
        </EmptyHeader>
      </Empty>
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
      <div className="p-4 h-full flex flex-col">
        <Empty className="rounded-md border-solid border-destructive/20 bg-destructive/5 p-4 gap-2">
          <EmptyHeader className="gap-1">
            <EmptyTitle className="text-destructive text-sm">
              Error loading tables
            </EmptyTitle>
            <EmptyDescription className="text-destructive/80 text-xs">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 text-destructive border-destructive/20 hover:bg-destructive/10">
              Retry
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (tables.length === 0) {
    return (
      <Empty className="h-full flex-1 rounded-none border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={TableIcon} />
          </EmptyMedia>
          <EmptyTitle>No tables found</EmptyTitle>
          <EmptyDescription>
            No tables or views found in schema <span className="font-medium text-foreground">{schema}</span>
          </EmptyDescription>
        </EmptyHeader>
        {!isRestricted && (
          <EmptyContent>
            <TableFormSheet schema={schema}>
              <span className="ml-1">Create Table</span>
            </TableFormSheet>
          </EmptyContent>
        )}
      </Empty>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0 relative">
      <div className="p-4 pb-2 shrink-0">
        <div className="flex gap-1">
          <Input
            placeholder={PLACEHOLDERS.SEARCH_TABLES}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          {!isRestricted && <TableFormSheet schema={schema} />}
        </div>
      </div>
      <ScrollArea
        className="px-2 overflow-y-auto overflow-x-hidden absolute inset-x-0 bottom-0"
        style={{ top: '0px' }}
      >
        {filteredTables.length === 0 ? (
          <Empty className="h-full flex-1 rounded-none border-0 py-8">
            <EmptyHeader>
              <EmptyTitle className="text-sm">No results</EmptyTitle>
              <EmptyDescription>
                {searchQuery
                  ? `No tables found matching "${searchQuery}"`
                  : 'No tables found'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarMenu className="space-y-1">
              {filteredTables.map((table) => {
                const isActive = search.table === table.name

                return (
                  <SidebarMenuItem key={`${schema}.${table.name}`}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleTableClick(table)}
                    >
                      <TableKindIcon kind={table.kind} />
                      {table.name}
                    </SidebarMenuButton>
                    {!isRestricted && <TableListAction schema={schema} table={table.name} kind={table.kind} />}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </ScrollArea>
    </div>
  )
}
