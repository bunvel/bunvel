import { SqlSidebar } from '@/components/sql/sql-sidebar'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

const SqlEditor = lazy(() => 
  import('@/components/sql/sql-editor').then((m) => ({ default: m.SqlEditor }))
)

export const Route = createFileRoute('/(main)/sql/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { showSidebar, queryHistory, selectFromHistory, clearHistory, addTab } =
    useSqlManager()

  return (
    <div className="h-full flex bg-card">
      <SqlSidebar
        isOpen={showSidebar}
        history={queryHistory}
        onSelect={selectFromHistory}
        onOpenInTab={addTab}
        onClear={clearHistory}
      />
      <div
        className={cn(
          'flex-1 flex flex-col h-full transition-all duration-200',
          showSidebar ? 'w-[80%]' : 'w-full',
        )}
      >
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">Loading SQL Editor...</div>}>
          <SqlEditor />
        </Suspense>
      </div>
    </div>
  )
}
