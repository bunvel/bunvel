import { SchemaSelector } from '@/components/editor/schema-selector'
import { TableList } from '@/components/editor/table-list'
import { TableTabs } from '@/components/editor/table-tabs'
import { TableViewer } from '@/components/editor/table-viewer'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PanelLeft, PanelLeftClose } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(main)/editor/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showSidebar, setShowSidebar] = useState(true)

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  return (
    <div className="h-full flex">
      <div
        className={cn(
          'bg-card border-r flex flex-col h-full overflow-hidden transition-all duration-200',
          showSidebar ? 'w-[20%]' : 'w-0 opacity-0'
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
          showSidebar ? 'w-[80%]' : 'w-full'
        )}
      >
        <div className="flex items-center border-b h-9">
          <button
            onClick={handleToggleSidebar}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm"
          >
            {showSidebar ? (
              <HugeiconsIcon icon={PanelLeftClose} className="h-4 w-4" />
            ) : (
              <HugeiconsIcon icon={PanelLeft} className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </button>
          <TableTabs />
        </div>
        <TableViewer />
      </div>
    </div>
  )
}
