import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { DangerousQueryAlert } from '@/components/sql/DangerousQueryAlert'
import { QueryInput } from '@/components/sql/QueryInput'
import { ResultsTable } from '@/components/sql/ResultsTable'
import { Button } from '@/components/ui/button'
import useSqlQuery from '@/hooks/useSqlQuery'
import { Copy } from 'lucide-react'

const DANGEROUS_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'GRANT',
  'REVOKE',
]

const isDangerousQuery = (query: string): boolean => {
  const upperQuery = query.toUpperCase()
  return DANGEROUS_KEYWORDS.some((keyword) => upperQuery.includes(keyword))
}

const splitAndCheckQueries = (
  query: string,
): { isDangerous: boolean; queries: string[] } => {
  // Split by semicolon and filter out empty queries
  const queries = query
    .split(';')
    .map((q) => q.trim())
    .filter((q) => q.length > 0)

  // Check each query for dangerous operations
  const hasDangerousQuery = queries.some(isDangerousQuery)

  return {
    isDangerous: hasDangerousQuery,
    queries: queries.map((q) => (q.endsWith(';') ? q : `${q};`)),
  }
}

export const Route = createFileRoute('/(main)/sql/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { query, setQuery, results, columns, isLoading, executeQuery } =
    useSqlQuery()
  const [showDangerousAlert, setShowDangerousAlert] = useState(false)
  const [pendingQuery, setPendingQuery] = useState('')

  const handleRunQuery = () => {
    const { isDangerous, queries } = splitAndCheckQueries(query)

    if (isDangerous) {
      setPendingQuery(queries.join('\n'))
      setShowDangerousAlert(true)
    } else {
      executeQuery(query)
    }
  }

  const handleConfirmDangerousQuery = () => {
    setShowDangerousAlert(false)
    executeQuery(pendingQuery)
  }

  const handleCancelDangerousQuery = () => {
    setShowDangerousAlert(false)
    setPendingQuery('')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <QueryInput
        query={query}
        isLoading={isLoading}
        onQueryChange={setQuery}
      />

      <div className="bg-sidebar-accent py-1 px-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1>Result</h1>
          {results.length > 0 && (
            <div className="flex items-center">
              <div className="h-3 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  alert('Copy' + results.length)
                }}
              >
                <Copy /> Copy
              </Button>
            </div>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleRunQuery}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Running...' : 'Run Query'}
        </Button>
      </div>

      <div className="flex-1 flex flex-col border-t overflow-hidden">
        <ResultsTable
          columns={columns}
          results={results}
          isLoading={isLoading}
        />
      </div>

      <DangerousQueryAlert
        isDangerous={showDangerousAlert}
        onConfirm={handleConfirmDangerousQuery}
        onCancel={handleCancelDangerousQuery}
      />
    </div>
  )
}

export default RouteComponent
