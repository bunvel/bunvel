import { Button } from '@/components/ui/button'
import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { Spinner } from '../ui/spinner'
import { ExportButton } from './export-button'

export function QueryResultActions() {
  const { query, activeTab, updateTabExecution, addToHistory } = useSqlManager()
  const { mutate: executeQuery, isPending: isExecuting } = useExecuteSqlQuery()
  const queryResult = activeTab?.result

  const handleExecute = () => {
    if (!query.trim() || !activeTab) return

    updateTabExecution(activeTab.id, undefined, undefined, true, query)

    executeQuery(query, {
      onSuccess: (result: any) => {
        updateTabExecution(activeTab.id, result, undefined, false, query)
        addToHistory(query, true)
      },
      onError: (error: any) => {
        updateTabExecution(activeTab.id, undefined, error, false, query)
        addToHistory(query, false)
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
