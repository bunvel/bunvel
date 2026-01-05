import { Button } from "@/components/ui/button"
import { LoaderCircle } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CopyButton, ExportButton } from "../editor/toolbar-buttons"

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

export function QueryResultActions({ result, isExecuting, onExecute, query }: QueryResultActionsProps) {

  return (
    <div className="bg-card h-10 px-2 flex items-center justify-between w-full border-b">
      <div className="flex items-center space-x-1">
        <h1 className="mr-2">Result</h1>
        {result?.data && result.data.length > 0 && (
          <>
            <CopyButton selectedRows={result.data} table="query_result" />
            <ExportButton 
              selectedRows={result.data} 
              table="query_result" 
              schema={new Date().toISOString()} 
            />
          </>
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
              <HugeiconsIcon icon={LoaderCircle} className="animate-spin h-4 w-4 mr-2" />
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
