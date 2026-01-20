import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { SqlTemplate } from '@/types'
import { FileText, Users } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { SQL_TEMPLATE_QUERIES } from './sql-template-queries'

const sqlTemplates: SqlTemplate[] = [
  {
    id: 'todo-complete',
    name: 'Todo',
    description:
      'Complete todo app setup with table, sample data, and performance indexes',
    query: SQL_TEMPLATE_QUERIES.todoComplete,
    icon: FileText,
  },
  {
    id: 'users-uuid-complete',
    name: 'Users',
    description:
      'User management system with UUID primary keys, sample data, and indexes',
    query: SQL_TEMPLATE_QUERIES.usersUuidComplete,
    icon: Users,
  },
  {
    id: 'posts-complete',
    name: 'Posts',
    description:
      'Blog posts system with table, sample content, and optimized indexes',
    query: SQL_TEMPLATE_QUERIES.postsComplete,
    icon: FileText,
  },
]

interface SqlTemplatesProps {
  onSelect: (query: string, title: string) => void
  className?: string
}

export function SqlTemplates({ onSelect, className }: SqlTemplatesProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-3 border-b">
        <h3 className="font-medium">Quick Templates</h3>
      </div>
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarMenu className="space-y-0.5">
            {sqlTemplates.map((template) => (
              <SidebarMenuItem key={template.id}>
                <SidebarMenuButton
                  className="justify-start h-auto py-1.5 px-2 hover:bg-accent/50"
                  onClick={() => onSelect(template.query, template.name)}
                >
                  <span className="mr-2 shrink-0 text-blue-500">
                    <HugeiconsIcon
                      icon={template.icon}
                      className="h-3.5 w-3.5"
                    />
                  </span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.description}
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </ScrollArea>
    </div>
  )
}
