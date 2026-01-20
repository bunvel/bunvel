import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Database,
  Home01Icon,
  SqlIcon,
  TableIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'

const navMain = [
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
]

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={
                  <Link to={item.url}>
                    <HugeiconsIcon icon={item.icon} />
                    <span>{item.title}</span>
                  </Link>
                }
                size="sm"
                title={item.title}
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
