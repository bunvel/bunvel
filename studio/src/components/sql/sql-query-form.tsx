import { Textarea } from "@/components/ui/textarea"

interface SqlQueryFormProps {
  query: string
  onQueryChange: (query: string) => void
  onExecute?: (e: React.KeyboardEvent) => void
}

export function SqlQueryForm({
  query,
  onQueryChange,
  onExecute,
}: SqlQueryFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (onExecute) {
        onExecute(e)
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-full rounded-none font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:ring-transparent focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-0 resize-none border-0 shadow-none"
          placeholder="Enter your SQL query here..."
        />
      </div>
    </div>
  )
}
