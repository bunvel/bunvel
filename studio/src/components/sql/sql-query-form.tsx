import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LoaderCircle } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface SqlQueryFormProps {
  query: string
  isExecuting: boolean
  onQueryChange: (query: string) => void
  onExecute: () => void
}

export function SqlQueryForm({
  query,
  isExecuting,
  onQueryChange,
  onExecute,
}: SqlQueryFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onExecute()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-full rounded-none font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none resize-none"
          placeholder="Enter your SQL query here..."
        />
      </div>
      <div className="py-1 px-4 bg-secondary flex items-center justify-between">
        <h1>Result</h1>
        <Button onClick={onExecute} disabled={isExecuting || !query.trim()}>
          {isExecuting ? (
            <>
              <HugeiconsIcon icon={LoaderCircle} className="animate-spin h-4 w-4 mr-2" />
              Executing...
            </>
          ) : (
            'Execute (Ctrl+Enter)'
          )}
        </Button>
      </div>
    </div>
  )
}
