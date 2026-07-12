import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ProjectProvider } from '@/contexts/project-context'
import { authClient } from '@/lib/auth-client'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)')({
  beforeLoad: async () => {
    // 1. Await the session securely from the backend (forwards cookies automatically)
    const { data: session } = await authClient.getSession();

    // 2. Reject unauthorized users BEFORE loaders run
    if (!session) {
      throw redirect({
        to: '/login',
      });
    }

    if (session.user.role !== 'admin') {
      throw redirect({
        to: '/login', // Or a dedicated unauthorized page if you have one
      });
    }

    // 3. Expose session data to child routes via context
    return {
      session,
    };
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
