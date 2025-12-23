import { createFileRoute } from '@tanstack/react-router'

import { QueryInput } from '@/components/sql/QueryInput'
import { ResultsTable } from '@/components/sql/ResultsTable'
import useSqlQuery from '@/hooks/useSqlQuery'

export const Route = createFileRoute('/(main)/sql/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { query, setQuery, results, columns, isLoading, executeQuery } =
    useSqlQuery()

  const handleRunQuery = () => {
    executeQuery(query)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <QueryInput
        query={query}
        isLoading={isLoading}
        onQueryChange={setQuery}
        onExecute={handleRunQuery}
      />

      <div className="flex-1 flex flex-col border-t overflow-hidden">
        <ResultsTable
          columns={columns}
          results={results}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default RouteComponent
