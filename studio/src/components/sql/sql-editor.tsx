import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useState } from 'react'
import { QueryResultActions } from './query-result-actions'
import { QueryResultTable } from './query-result-table'
import { SqlQueryForm } from './sql-query-form'

export function SqlEditor() {
  const [query, setQuery] = useState('')
  const {
    mutate: executeQuery,
    data: queryResult,
    error,
    isPending: isExecuting,
  } = useExecuteSqlQuery()

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
  }

  const handleExecute = () => {
    if (!query.trim()) return
    executeQuery(query)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-[350px] border-b overflow-y-auto">
        <SqlQueryForm
          query={query}
          onQueryChange={handleQueryChange}
          onExecute={handleExecute}
        />
      </div>
      <QueryResultActions
        result={queryResult}
        isExecuting={isExecuting}
        onExecute={handleExecute}
        query={query}
      />
      <div className="flex-1 min-h-0">
        <QueryResultTable 
          result={queryResult}
          isExecuting={isExecuting}
          error={error}
        />
      </div>
    </div>
  )
}
