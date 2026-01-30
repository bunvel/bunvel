import { useSqlManager } from '@/hooks/use-sql-manager'
import { cn } from '@/lib/utils'
import { ToggleSidebar } from '../common/toggle-sidebar'
import { MonacoSqlEditor } from './monaco-sql-editor'
import { QueryResultActions } from './query-result-actions'
import { QueryResultTable } from './query-result-table'
import { SqlTabs } from './sql-tabs'

export function SqlEditor() {
  const { showSidebar, handleToggleSidebar } = useSqlManager()

  return (
    <div className={cn('h-full flex flex-col')}>
      <div className="flex items-center gap-2 border-b">
        <ToggleSidebar
          onToggleSidebar={handleToggleSidebar}
          showSidebar={showSidebar}
        />
        <SqlTabs />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-[350px] border-b overflow-y-auto">
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <MonacoSqlEditor />
            </div>
          </div>
        </div>
        <QueryResultActions />
        <div className="flex-1 min-h-0">
          <QueryResultTable />
        </div>
      </div>
    </div>
  )
}
