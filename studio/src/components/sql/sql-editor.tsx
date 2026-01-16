import { Button } from '@/components/ui/button'
import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { cn } from '@/lib/utils'
import {
  Alert,
  Check,
  Info,
  PanelLeft,
  PanelLeftClose
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { Spinner } from '../ui/spinner'
import { QueryResultActions } from './query-result-actions'
import { QueryResultTable } from './query-result-table'
import { SqlQueryForm } from './sql-query-form'

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
  const [query, setQuery] = useState(initialQuery)
  const [lastExecutedQuery, setLastExecutedQuery] = useState('')

  // Update query state when initialQuery changes
  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  const {
    mutate: executeQuery,
    data: queryResult,
    error,
    isPending: isExecuting,
  } = useExecuteSqlQuery()

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
  }

  const handleExecute = () => {
    if (!query.trim()) return
    setLastExecutedQuery(query)
    executeQuery(query, {
      onSuccess: () => onAddToHistory?.(query, true),
      onError: () => onAddToHistory?.(query, false),
    })
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <div className="flex items-center justify-between p-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="h-8 w-8 p-0"
        >
          {showSidebar ? (
            <HugeiconsIcon icon={PanelLeftClose} className="h-4 w-4" />
          ) : (
            <HugeiconsIcon icon={PanelLeft} className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
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
              <Spinner/>
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
