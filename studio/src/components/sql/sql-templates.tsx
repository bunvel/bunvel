import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Database, FileText, Plus, Users } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { SQL_TEMPLATE_QUERIES } from './sql-template-queries'

export interface SqlTemplate {
  id: string
  name: string
  description: string
  category: string
  query: string
  icon: any
}

const sqlTemplates: SqlTemplate[] = [
  {
    id: 'todo-complete',
    name: 'Todo - Complete Setup',
    description: 'Create table, insert sample data, and add indexes',
    category: 'Todo',
    query: SQL_TEMPLATE_QUERIES.todoComplete,
    icon: FileText,
  },
  {
    id: 'users-uuid-complete',
    name: 'Users - UUID Setup',
    description: 'Create table with UUID primary key, sample data, and indexes',
    category: 'User Management',
    query: SQL_TEMPLATE_QUERIES.usersUuidComplete,
    icon: Users,
  },
  {
    id: 'posts-complete',
    name: 'Posts - Complete Setup',
    description: 'Create table, insert sample data, and add indexes',
    category: 'Posts',
    query: SQL_TEMPLATE_QUERIES.postsComplete,
    icon: FileText,
  },
  {
    id: 'uuid-complete',
    name: 'UUID - Complete Schema',
    description:
      'Full UUID-based schema with users, profiles, posts, and comments',
    category: 'UUID',
    query: SQL_TEMPLATE_QUERIES.uuidComplete,
    icon: Database,
  },
]

interface SqlTemplatesProps {
  onSelect: (query: string) => void
  onOpenInTab?: (query: string, title: string) => void
  className?: string
}

export function SqlTemplates({
  onSelect,
  onOpenInTab,
  className,
}: SqlTemplatesProps) {
  const groupedTemplates = sqlTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    },
    {} as Record<string, SqlTemplate[]>,
  )

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-3 border-b">
        <h3 className="font-medium">Quick Templates</h3>
      </div>
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category} className="mb-4">
              <div className="px-2 py-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </h4>
              </div>
              <SidebarMenu className="space-y-0.5">
                {templates.map((template) => (
                  <SidebarMenuItem key={template.id}>
                    <div className="flex w-full">
                      <SidebarMenuButton
                        className="flex-1 justify-start h-auto py-1.5 px-2 hover:bg-accent/50"
                        onClick={() => onSelect(template.query)}
                      >
                        <span className="mr-2 shrink-0 text-blue-500">
                          <HugeiconsIcon
                            icon={template.icon}
                            className="h-3.5 w-3.5"
                          />
                        </span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
                            {template.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </SidebarMenuButton>
                      {onOpenInTab && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() =>
                            onOpenInTab(template.query, template.name)
                          }
                          title="Open in new tab"
                        >
                          <HugeiconsIcon icon={Plus} className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          ))}
        </SidebarGroup>
      </ScrollArea>
    </div>
  )
}
