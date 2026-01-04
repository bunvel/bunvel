import * as React from 'react'

import { NavMain } from '@/components/layout/nav-main'
import { NavSecondary } from '@/components/layout/nav-secondary'
import { NavUser } from '@/components/layout/nav-user'
import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar'
import {
  Home01Icon,
  SqlIcon,
  TableIcon
} from '@hugeicons/core-free-icons'

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
    }
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
