import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { QueryHistoryItem } from '@/types/components'
import type { SqlTab } from '@/types/tabs'
import { ChevronRight, Plus, Search, SqlIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'
import { sqlTemplates } from './sql-templates'

interface SqlSidebarProps {
  isOpen: boolean
  history: Array<QueryHistoryItem>
  onSelect: (query: string) => void
  onClear: () => void
  onOpenInTab?: (tab: SqlTab) => void
  className?: string
}

export function SqlSidebar({
  isOpen,
  history,
  onSelect,
  onClear,
  onOpenInTab,
  className,
}: SqlSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSelectQuery = (query: string, title?: string) => {
    if (onOpenInTab) {
      const tab: SqlTab = {
        id: `query-${Date.now()}`,
        title: title || 'New Query',
        query,
        isModified: false,
      }
      onOpenInTab(tab)
    } else {
      onSelect(query)
    }
  }

  // Remove duplicates and keep only the latest version of each query
  const uniqueHistory = useMemo(() => {
    const uniqueQueries = new Map<string, QueryHistoryItem>()
    ;[...history].reverse().forEach((item) => {
      if (!uniqueQueries.has(item.query)) {
        uniqueQueries.set(item.query, item)
      }
    })
    const arr = Array.from(uniqueQueries.values()).reverse()
    if (!searchQuery) return arr
    return arr.filter((item) =>
      item.query.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [history, searchQuery])

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return sqlTemplates
    return sqlTemplates.filter((template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  return (
    <div
      className={cn(
        'w-[20%] border-r transition-all duration-200 overflow-hidden bg-card flex flex-col',
        !isOpen && 'w-0 opacity-0',
        className,
      )}
    >
      <div className="p-4 border-b flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-base">SQL Editor</h2>
        </div>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queries..."
              className="pl-8 h-9 bg-background/50 border-input"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => handleSelectQuery('', 'Untitled query')}
          >
            <HugeiconsIcon icon={Plus} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <div className="p-2 space-y-4">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel
                render={
                  <div className="flex w-full items-center justify-between pr-2">
                    <CollapsibleTrigger className="hover:text-accent-foreground text-muted-foreground cursor-pointer flex flex-1 items-center font-medium tracking-wide">
                      <HugeiconsIcon
                        icon={ChevronRight}
                        className="mr-2 h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90"
                      />
                      PRIVATE{' '}
                      {uniqueHistory.length > 0 && (
                        <span className="ml-1 opacity-70">
                          ({uniqueHistory.length})
                        </span>
                      )}
                    </CollapsibleTrigger>
                    {uniqueHistory.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px]"
                        onClick={onClear}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                }
              />
              <CollapsibleContent>
                <SidebarGroupContent className="mt-1">
                  <SidebarMenu className="gap-0.5">
                    {uniqueHistory.length === 0 ? (
                      <Empty className="py-6 border-0 bg-transparent rounded-none">
                        <EmptyHeader>
                          <EmptyTitle className="text-sm">
                            No queries
                          </EmptyTitle>
                          <EmptyDescription className="text-xs">
                            {searchQuery
                              ? 'No queries match your search'
                              : 'Your query history will appear here'}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      uniqueHistory.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            className="w-full justify-start py-1.5 hover:bg-accent/50 h-auto"
                            onClick={() =>
                              handleSelectQuery(item.query, 'Untitled query')
                            }
                            title={item.query}
                          >
                            <span
                              className={cn(
                                'mr-2 shrink-0',
                                item.success
                                  ? 'text-green-500/70'
                                  : 'text-destructive/70',
                              )}
                            >
                              <HugeiconsIcon
                                icon={SqlIcon}
                                className="h-4 w-4"
                              />
                            </span>
                            <span className="truncate flex-1 text-left text-sm text-foreground/90">
                              Untitled query
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          <Collapsible className="group/collapsible">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel
                render={
                  <CollapsibleTrigger className="hover:text-accent-foreground text-muted-foreground cursor-pointer flex w-full items-center font-medium tracking-wide">
                    <HugeiconsIcon
                      icon={ChevronRight}
                      className="mr-2 h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90"
                    />
                    EXAMPLES
                  </CollapsibleTrigger>
                }
              />
              <CollapsibleContent>
                <SidebarGroupContent className="mt-1">
                  <SidebarMenu className="gap-0.5">
                    {filteredTemplates.length === 0 ? (
                      <Empty className="py-6 border-0 bg-transparent rounded-none">
                        <EmptyHeader>
                          <EmptyTitle className="text-sm">
                            No templates
                          </EmptyTitle>
                          <EmptyDescription className="text-xs">
                            {searchQuery
                              ? 'No templates match your search'
                              : 'No SQL templates available'}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      filteredTemplates.map((template) => (
                        <SidebarMenuItem key={template.id}>
                          <SidebarMenuButton
                            className="w-full justify-start py-1.5 hover:bg-accent/50 h-auto"
                            onClick={() =>
                              handleSelectQuery(template.query, template.name)
                            }
                          >
                            <span className="mr-2 shrink-0 text-muted-foreground/70">
                              <HugeiconsIcon
                                icon={template.icon}
                                className="h-4 w-4"
                              />
                            </span>
                            <span className="truncate flex-1 text-left text-sm text-foreground/90">
                              {template.name}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}
