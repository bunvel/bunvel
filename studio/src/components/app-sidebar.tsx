import { Code, Database, Home } from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Bunvel',
    email: 'admin@bunvel.com',
    avatar: '/logo.svg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'SQL Editor',
      url: '/sql',
      icon: Code,
    },
    {
      title: 'Data Explorer',
      url: '/explorer',
      icon: Database,
    },
  ],
  navSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
      collapsible="icon"
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
