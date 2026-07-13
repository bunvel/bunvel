import { ToggleSidebar } from '@/components/common/toggle-sidebar'
import { SchemaSelector } from '@/components/database/schema/schema-selector'
import { TableList } from '@/components/database/tables/table-list'
import { TableTabs } from '@/components/database/tables/table-tabs'
import { Separator } from '@/components/ui/separator'
import { isRestrictedSchema } from '@/lib/restricated-schema'
import { cn } from '@/lib/utils'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { Suspense, lazy, useState } from 'react'

const TableViewer = lazy(() =>
  import('@/components/database/tables/table-viewer').then((m) => ({ default: m.TableViewer }))
)

export const Route = createFileRoute('/(main)/editor/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showSidebar, setShowSidebar] = useState(true)
  const search = useSearch({ strict: false }) as {
    schema?: string
    table?: string
  }

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const isProtected = isRestrictedSchema(search.schema)

  return (
    <div className="h-full flex">
      <div
        className={cn(
          'bg-card border-r flex flex-col h-full overflow-hidden transition-all duration-200',
          showSidebar ? 'w-[20%]' : 'w-0 opacity-0',
        )}
      >
        <div className="flex items-center justify-between px-4 pt-1.5">
          <h1 className="font-semibold">Table Editor</h1>
        </div>
        <SchemaSelector hideCreate={false} />
        <Separator />
        <TableList />
      </div>
      <div
        className={cn(
          'bg-card h-full overflow-hidden transition-all duration-200',
          showSidebar ? 'w-[80%]' : 'w-full',
        )}
      >
        <div className="h-full flex flex-col">
          {isProtected && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">Viewing protected schema:</span>{' '}
                The {search.schema} schema is managed by Bunvel and is read-only
                through the dashboard.
              </p>
            </div>
          )}
          <div className="flex items-center">
            <ToggleSidebar
              onToggleSidebar={handleToggleSidebar}
              showSidebar={showSidebar}
            />
            <TableTabs />
          </div>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">Loading Editor...</div>}>
            <TableViewer />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
