import { DatabaseSidebar } from '@/components/database/database-sidebar'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/database')({
  component: DatabaseLayout,
})

function DatabaseLayout() {
  return (
    <div className="h-full flex">
      <div className="w-[20%] bg-card border-r flex flex-col h-full overflow-hidden">
        <h1 className="font-semibold px-4 pt-1.5">Database</h1>
        <DatabaseSidebar/>
      </div>
      <div className="w-[80%] bg-card h-full overflow-y-scroll">
        <Outlet/>
      </div>
    </div>
  )
}
