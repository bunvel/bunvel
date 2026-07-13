import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ProjectProvider } from '@/contexts/project-context'
import { fetchSession } from '@/lib/session'
import type { fetchSession as FetchSessionType } from '@/lib/session'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

type Session = NonNullable<Awaited<ReturnType<typeof FetchSessionType>>>

export interface MainRouteContext {
  session: Session
}

export const Route = createFileRoute('/(main)')({
  beforeLoad: async (): Promise<MainRouteContext> => {
    // fetchSession is a server function — it has proper request context so
    // getRequestHeader can read the browser's cookie and forward it to the
    // backend. Using authClient.getSession() directly here would silently
    // drop the cookie because beforeLoad does not run inside a server
    // function context.
    const session = await fetchSession()

    if (!session) {
      throw redirect({ to: '/login' })
    }

    if (session.user.role !== 'admin') {
      throw redirect({ to: '/login' })
    }

    return { session }
  },
  component: MainLayout,
})

function MainLayout() {
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
