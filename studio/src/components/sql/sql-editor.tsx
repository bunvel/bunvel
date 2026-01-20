import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useSqlTabs } from '@/hooks/use-sql-tabs'
import { cn } from '@/lib/utils'
import { Alert, Check, Info } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { ToggleSidebar } from '../common/toggle-sidebar'
import { Spinner } from '../ui/spinner'
import { QueryResultActions } from './query-result-actions'
import { QueryResultTable } from './query-result-table'
import { SqlQueryForm } from './sql-query-form'
import { SqlTabs } from './sql-tabs'

interface SqlEditorProps {
  showSidebar?: boolean
  onToggleSidebar?: () => void
  onAddToHistory?: (query: string, success: boolean) => void
  className?: string
  initialQuery?: string
}

export function SqlEditor({
  showSidebar = true,
  onToggleSidebar,
  onAddToHistory,
  className,
  initialQuery = '',
}: SqlEditorProps) {
  const { activeTab, updateTabQuery, updateTabExecution } = useSqlTabs()
  const [query, setQuery] = useState(initialQuery)

  // Update query state when active tab changes
  useEffect(() => {
    if (activeTab) {
      setQuery(activeTab.query)
    }
  }, [activeTab])

  // Update query state when initialQuery changes
  useEffect(() => {
    if (initialQuery !== undefined && !activeTab) {
      setQuery(initialQuery)
    }
  }, [initialQuery, activeTab])

  const { mutate: executeQuery } = useExecuteSqlQuery()

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    if (activeTab) {
      updateTabQuery(activeTab.id, newQuery)
    }
  }

  const handleExecute = () => {
    if (!query.trim() || !activeTab) return

    // Set executing state
    updateTabExecution(activeTab.id, undefined, undefined, true, query)

    executeQuery(query, {
      onSuccess: (result) => {
        updateTabExecution(activeTab.id, result, undefined, false, query)
        onAddToHistory?.(query, true)
      },
      onError: (error) => {
        updateTabExecution(activeTab.id, undefined, error, false, query)
        onAddToHistory?.(query, false)
      },
    })
  }

  // Get current tab's execution state
  const queryResult = activeTab?.result
  const error = activeTab?.error
  const isExecuting = activeTab?.isExecuting || false
  const lastExecutedQuery = activeTab?.lastExecutedQuery || ''

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <div className="flex items-center gap-2 border-b">
        <ToggleSidebar
          onToggleSidebar={onToggleSidebar}
          showSidebar={showSidebar}
        />
        <SqlTabs />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-[350px] border-b overflow-y-auto">
          <SqlQueryForm
            query={query}
            onQueryChange={handleQueryChange}
            onExecute={handleExecute}
          />
        </div>
        <QueryResultActions
          result={queryResult}
          isExecuting={isExecuting}
          onExecute={handleExecute}
          query={query}
        />
        <div className="flex-1 min-h-0">
          {!lastExecutedQuery?.trim() ? (
            <p className="flex items-center p-4 text-sm text-muted-foreground bg-secondary">
              <HugeiconsIcon icon={Info} className="h-4 w-4 mr-1" />
              Enter your SQL query and click
              <span className="font-medium"> Run</span> to execute it
            </p>
          ) : isExecuting ? (
            <div className="flex items-center gap-2 p-4 text-muted-foreground bg-secondary">
              <Spinner />
              <span>Executing query...</span>
            </div>
          ) : error ? (
            <div className="flex items-center p-4 text-destructive bg-destructive/10">
              <HugeiconsIcon
                icon={Alert}
                className="h-4 w-4 mr-1 text-destructive"
              />
              <p className="text-sm">{error.message}</p>
            </div>
          ) : queryResult?.data.length === 0 ? (
            <div className="flex items-center gap-2 p-4 text-muted-foreground bg-secondary">
              <HugeiconsIcon
                icon={Check}
                className="h-4 w-4 mr-1 text-green-500"
              />
              <span>Query executed successfully. No rows returned.</span>
            </div>
          ) : (
            <QueryResultTable
              result={queryResult}
              isExecuting={isExecuting}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  )
}
