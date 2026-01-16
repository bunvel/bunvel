import { Button } from '@/components/ui/button'
import { Spinner } from '../ui/spinner'
import { ExportButton } from './export-button'

interface QueryResultActionsProps {
  result?: {
    data: any[]
    columns: string[]
    rowCount: number
    executionTime?: number
  }
  isExecuting?: boolean
  onExecute?: () => void
  query?: string
}

export function QueryResultActions({
  result,
  isExecuting,
  onExecute,
  query,
}: QueryResultActionsProps) {
  return (
    <div className="bg-card h-10 px-2 flex items-center justify-between w-full border-b">
      <div className="flex items-center space-x-1">
        <h1 className="mr-2">Result</h1>
        {result?.data && result.data.length > 0 && (
          <ExportButton selectedRows={result.data} />
        )}
      </div>

      {onExecute && (
        <Button
          onClick={onExecute}
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
      )}
    </div>
  )
}
