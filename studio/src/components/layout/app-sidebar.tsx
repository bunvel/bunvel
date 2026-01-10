import * as React from 'react'

import { NavMain } from '@/components/layout/nav-main'
import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar'
import { Database, Home01Icon, SqlIcon, TableIcon } from '@hugeicons/core-free-icons'
import { NavUser } from './nav-user'

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
      icon: Home01Icon,
    },
    {
      title: 'SQL Editor',
      url: '/sql',
      icon: SqlIcon,
    },
    {
      title: 'Table Editor',
      url: '/editor',
      icon: TableIcon,
    },
    {
      title: 'Database',
      url: '/database/tables',
      icon: Database,
    },
  ],
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
