import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Check, Plus, X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo } from 'react'

export interface QueryHistoryItem {
  id: string
  query: string
  timestamp: number
  success: boolean
}

interface QueryHistoryProps {
  history: QueryHistoryItem[]
  onSelect: (query: string) => void
  onOpenInTab?: (query: string, title?: string) => void
  onClear: () => void
  className?: string
}

export function QueryHistory({
  history,
  onSelect,
  onOpenInTab,
  onClear,
  className,
}: QueryHistoryProps) {
  // Remove duplicates and keep only the latest version of each query
  const uniqueHistory = useMemo(() => {
    const uniqueQueries = new Map<string, QueryHistoryItem>()
    // Process in reverse to keep the latest occurrence of each query
    ;[...history].reverse().forEach((item) => {
      if (!uniqueQueries.has(item.query)) {
        uniqueQueries.set(item.query, item)
      }
    })
    return Array.from(uniqueQueries.values()).reverse()
  }, [history])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium">Query History</h3>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={onClear}
          >
            Clear
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        {uniqueHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">
            No queries in history
          </p>
        ) : (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarMenu className="space-y-0.5">
              {uniqueHistory.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <div className="flex w-full">
                    <SidebarMenuButton
                      className="flex-1 justify-start h-auto py-1.5 px-2 hover:bg-accent/50"
                      onClick={() => onSelect(item.query)}
                    >
                      <span
                        className={cn(
                          'mr-2 shrink-0',
                          item.success ? 'text-green-500' : 'text-destructive',
                        )}
                      >
                        <HugeiconsIcon
                          icon={item.success ? Check : X}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="truncate flex-1 text-left text-sm font-mono">
                        {item.query}
                      </span>
                    </SidebarMenuButton>
                    {onOpenInTab && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => onOpenInTab(item.query, 'New Query')}
                        title="Open in new tab"
                      >
                        <HugeiconsIcon icon={Plus} className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </ScrollArea>
    </div>
  )
}
