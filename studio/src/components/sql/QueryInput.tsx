import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface QueryInputProps {
  query: string
  isLoading: boolean
  onQueryChange: (value: string) => void
  onExecute: () => void
}

export const QueryInput = ({
  query,
  isLoading,
  onQueryChange,
  onExecute,
}: QueryInputProps) => {
  return (
    <div className="flex-1 flex flex-col bg-sidebar">
      <Textarea
        placeholder="Enter your SQL query here..."
        className="h-[350px] font-mono rounded-none border-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none hover:border-0"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        disabled={isLoading}
      />
      <div className="bg-sidebar-accent py-1 px-2 flex items-center justify-between">
        <h1>Result</h1>
        <Button size='sm' onClick={onExecute} disabled={isLoading || !query.trim()}>
          {isLoading ? 'Running...' : 'Run Query'}
        </Button>
      </div>
    </div>
  )
}

export default QueryInput
