import { QueryHistoryItem } from '@/components/sql/query-history'
import { SqlEditor } from '@/components/sql/sql-editor'
import { SqlSidebar } from '@/components/sql/sql-sidebar'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(main)/sql/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [history, setHistory] = useLocalStorage<QueryHistoryItem[]>(
    'sql-query-history',
    [],
  )
  const [selectedQuery, setSelectedQuery] = useState('')

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const handleClearHistory = () => {
    setHistory([])
  }

  const handleAddToHistory = (query: string, success: boolean) => {
    setHistory((prev) =>
      [
        {
          id: Date.now().toString(),
          query,
          timestamp: Date.now(),
          success,
        },
        ...prev,
      ].slice(0, 50),
    )
  }

  const handleSelectFromHistory = (selectedQuery: string) => {
    setSelectedQuery(selectedQuery)
  }

  return (
    <div className="h-full flex bg-card">
      <SqlSidebar
        isOpen={showSidebar}
        history={history}
        onSelect={handleSelectFromHistory}
        onClear={handleClearHistory}
      />
      <div
        className={cn(
          'flex-1 flex flex-col h-full transition-all duration-200',
          showSidebar ? 'w-[80%]' : 'w-full',
        )}
      >
        <SqlEditor
          showSidebar={showSidebar}
          onToggleSidebar={handleToggleSidebar}
          onAddToHistory={handleAddToHistory}
          initialQuery={selectedQuery}
          className="h-full"
        />
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
