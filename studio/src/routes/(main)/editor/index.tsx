import { SchemaSelector } from '@/components/editor/schema-selector'
import { TableList } from '@/components/editor/table-list'
import { TableViewer } from '@/components/editor/table-viewer'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/editor/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-full flex">
      <div className="w-[20%] bg-card border-r flex flex-col h-full overflow-hidden">
        <h1 className="font-semibold px-4 pt-1.5">Table Editor</h1>
        <SchemaSelector />
        <Separator/>
        <TableList />
      </div>
      <div className="w-[80%] bg-card h-full overflow-hidden">
        <TableViewer/>
      </div>
    </div>
  )
}
