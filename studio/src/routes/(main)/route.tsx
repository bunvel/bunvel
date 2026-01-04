import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="[--header-height:calc(--spacing(14))] h-screen flex flex-col overflow-hidden">
      <SidebarProvider className="flex flex-col h-full" defaultOpen={false}>
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
