import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ProjectProvider } from '@/contexts/project-context'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)')({
  component: MainLayout,
})

import { useSession } from '@/lib/auth-client'
import { Navigate } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'

function MainLayout() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" />
  }

  if (session.user.role !== 'admin') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="mt-2 text-muted-foreground">Admin access is required to view the Studio.</p>
      </div>
    )
  }

  return (
    <ProjectProvider>
      <div className="[--header-height:calc(--spacing(14))] h-screen flex flex-col overflow-hidden">
        <SidebarProvider className="flex flex-col h-full" open={false}>
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
    </ProjectProvider>
  )
}
