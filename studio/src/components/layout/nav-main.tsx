import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NAV_MAIN_ITEMS } from '@/constants/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_MAIN_ITEMS.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={
                  <Link
                    to={item.to}
                    activeOptions={{ exact: false }}
                    activeProps={{ 'data-active': true }}
                  >
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
