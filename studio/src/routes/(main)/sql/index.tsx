import { SqlEditor } from '@/components/sql/sql-editor'
import { SqlSidebar } from '@/components/sql/sql-sidebar'
import { SqlTabsProvider, useSqlTabsContext } from '@/contexts/sql-tabs-context'
import { useQueryHistory } from '@/hooks/use-query-history'
import { cn } from '@/lib/utils'
import type { SqlTab } from '@/types'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(main)/sql/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SqlTabsProvider>
      <SqlRouteContent />
    </SqlTabsProvider>
  )
}

function SqlRouteContent() {
  const [showSidebar, setShowSidebar] = useState(true)
  const { addTab } = useSqlTabsContext()
  const [selectedQuery, setSelectedQuery] = useState('')
  const { history, addToHistory, clearHistory, selectFromHistory } =
    useQueryHistory(setSelectedQuery)

  const handleToggleSidebar = () => {
    setShowSidebar((prev) => !prev)
  }

  const handleOpenInTab = (tab: SqlTab) => {
    addTab(tab)
  }

  return (
    <div className="h-full flex bg-card">
      <SqlSidebar
        isOpen={showSidebar}
        history={history}
        onSelect={selectFromHistory}
        onOpenInTab={handleOpenInTab}
        onClear={clearHistory}
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
          onAddToHistory={addToHistory}
          initialQuery={selectedQuery}
          className="h-full"
        />
      </div>
    </div>
  )
}
