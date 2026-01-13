import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link, useMatches } from '@tanstack/react-router'
import { useCallback } from 'react'

type MenuItem = {
  id: string
  name: string
  url: string
}

const menuItems: MenuItem[] = [
  {
    id: 'tables',
    name: 'Tables',
    url: '/database/tables',
  },
  {
    id: 'indexes',
    name: 'Indexes',
    url: '/database/indexes',
  },
  {
    id: 'functions',
    name: 'Functions',
    url: '/database/functions',
  },
  {
    id: 'triggers',
    name: 'Triggers',
    url: '/database/triggers',
  },
  {
    id: 'types',
    name: 'Enumerated Types',
    url: '/database/types',
  },
]

export function DatabaseSidebar() {
  const matches = useMatches()

  const isActive = useCallback(
    (to: string) => {
      return matches.some((match) => match.pathname.startsWith(to))
    },
    [matches],
  )

  return (
    <div className="flex flex-col h-full w-full gap-2">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu className="mt-2">
          {menuItems.map((item: MenuItem) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={isActive(item.url)}
                render={
                  <Link to={item.url}>
                    <span className="ml-2">{item.name}</span>
                  </Link>
                }
              ></SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  )
}
