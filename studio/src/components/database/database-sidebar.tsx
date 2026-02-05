import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { MenuItem } from '@/constants/navigation'
import { DATABASE_MENU_ITEMS } from '@/constants/navigation'
import { ListTodo } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'

export function DatabaseSidebar() {
  return (
    <div className="flex flex-col h-full w-full gap-2">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu className="mt-2 space-y-1">
          {DATABASE_MENU_ITEMS.map((item: MenuItem) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={
                  <Link
                    to={item.to}
                    activeOptions={{ exact: false }}
                    activeProps={{ 'data-active': true }}
                  >
                    <HugeiconsIcon icon={ListTodo} />
                    <span className="ml-2">{item.title}</span>
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
