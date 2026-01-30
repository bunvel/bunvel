import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ListTodo } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useMatches } from '@tanstack/react-router'

type MenuItem = {
  id: string
  name: string
  url: string
}

const menuItems: MenuItem[] = [
  {
    id: 'schemas',
    name: 'Schema Diagram',
    url: '/database/schemas',
  },
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

  const isActive = (to: string) => {
    return matches.some((match) => match.pathname.startsWith(to))
  }

  return (
    <div className="flex flex-col h-full w-full gap-2">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu className="mt-2 space-y-1">
          {menuItems.map((item: MenuItem) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={isActive(item.url)}
                render={
                  <Link to={item.url}>
                    <HugeiconsIcon icon={ListTodo} />
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
