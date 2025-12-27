import { Textarea } from '@/components/ui/textarea'

interface QueryInputProps {
  query: string
  isLoading: boolean
  onQueryChange: (value: string) => void
}

export const QueryInput = ({
  query,
  isLoading,
  onQueryChange,
}: QueryInputProps) => {
  return (
    <Textarea
      placeholder="Enter your SQL query here..."
      className="h-[300px] font-mono rounded-none border-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none hover:border-0"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      disabled={isLoading}
    />
  )
}

export default QueryInput
