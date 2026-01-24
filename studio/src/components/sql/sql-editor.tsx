import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { cn } from '@/lib/utils'
import { Alert, Check, Info } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ToggleSidebar } from '../common/toggle-sidebar'
import { Spinner } from '../ui/spinner'
import { QueryResultActions } from './query-result-actions'
import { QueryResultTable } from './query-result-table'
import { SqlQueryForm } from './sql-query-form'
import { SqlTabs } from './sql-tabs'

export function SqlEditor() {
  const {
    activeTab,
    query,
    setQuery,
    updateTabExecution,
    addToHistory,
    showSidebar,
    handleToggleSidebar,
  } = useSqlManager()

  const { mutate: executeQuery } = useExecuteSqlQuery()

  const handleExecute = () => {
    if (!query.trim() || !activeTab) return

    // Set executing state
    updateTabExecution(activeTab.id, undefined, undefined, true, query)

    executeQuery(query, {
      onSuccess: (result) => {
        updateTabExecution(activeTab.id, result, undefined, false, query)
        addToHistory(query, true)
      },
      onError: (error) => {
        updateTabExecution(activeTab.id, undefined, error, false, query)
        addToHistory(query, false)
      },
    })
  }

  // Get current tab's execution state
  const queryResult = activeTab?.result
  const error = activeTab?.error
  const isExecuting = activeTab?.isExecuting || false
  const lastExecutedQuery = activeTab?.lastExecutedQuery || ''

  return (
    <div className={cn('h-full flex flex-col')}>
      <div className="flex items-center gap-2 border-b">
        <ToggleSidebar
          onToggleSidebar={handleToggleSidebar}
          showSidebar={showSidebar}
        />
        <SqlTabs />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-[350px] border-b overflow-y-auto">
          <SqlQueryForm
            query={query}
            onQueryChange={setQuery}
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
              <HugeiconsIcon icon={Alert} className="h-4 w-4 mr-1" />
              <span className="font-medium">Error:</span>
              <span className="ml-2 text-sm">
                {error.message || 'Unknown error occurred'}
              </span>
            </div>
          ) : queryResult ? (
            <div className="h-full">
              <div className="flex items-center gap-2 p-4 text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-950/50 border-b">
                <HugeiconsIcon icon={Check} className="h-4 w-4" />
                <span className="font-medium">Query executed successfully</span>
                <span className="text-sm text-muted-foreground">
                  ({queryResult.rowCount} rows returned)
                </span>
              </div>
              <QueryResultTable
                result={queryResult}
                isExecuting={isExecuting}
                error={error}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
