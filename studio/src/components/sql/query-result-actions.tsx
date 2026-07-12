import { Button } from '@/components/ui/button'
import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { Spinner } from '@/components/ui/spinner'
import { ExportButton } from './export-button'

export function QueryResultActions() {
  const { query, activeTab, updateTabExecution, addToHistory } = useSqlManager()
  const { mutate: executeQuery, isPending: isExecuting } = useExecuteSqlQuery()
  const queryResult = activeTab?.result

  const handleExecute = () => {
    if (!query.trim() || !activeTab) return

    let finalQuery = query.trim()
    const isSelectQuery = /^\s*(WITH\s+[\s\S]+?)?SELECT\b/i.test(finalQuery)
    const hasLimit = /\bLIMIT\s+\d+/i.test(finalQuery)

    if (isSelectQuery && !hasLimit) {
      const confirmRun = window.confirm(
        'Your query does not have a LIMIT clause and may fetch a large amount of data. Are you sure you want to execute it?'
      )
      if (!confirmRun) return
    }

    updateTabExecution(activeTab.id, undefined, undefined, true, finalQuery)

    executeQuery(finalQuery, {
      onSuccess: (result: any) => {
        updateTabExecution(activeTab.id, result, undefined, false, finalQuery)
        addToHistory(finalQuery, true)
      },
      onError: (error: any) => {
        updateTabExecution(activeTab.id, undefined, error, false, finalQuery)
        addToHistory(finalQuery, false)
      },
    })
  }
  return (
    <div className="bg-card px-4 py-2 flex items-center justify-between w-full border-b">
      <div className="flex items-center space-x-1">
        <h1 className="mr-2 text-sm">Result</h1>
        <span className="text-muted">|</span>
        {queryResult?.data && queryResult.data.length > 0 && (
          <ExportButton selectedRows={queryResult.data} />
        )}
      </div>

      <Button
        onClick={handleExecute}
        disabled={isExecuting || !query?.trim()}
        size="sm"
        variant="default"
      >
        {isExecuting ? (
          <>
            <Spinner />
            Executing...
          </>
        ) : (
          'Execute (Ctrl+Enter)'
        )}
      </Button>
    </div>
  )
}
