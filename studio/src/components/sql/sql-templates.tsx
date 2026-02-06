import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { SqlTemplate } from '@/types/components'
import { SQL_TEMPLATE_QUERIES } from '@/utils/sql/sql-template-queries'
import {
  FileText,
  Home01Icon,
  PenTool,
  TableIcon,
  Users,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useState } from 'react'

const sqlTemplates: Array<SqlTemplate> = [
  {
    id: 'todo-complete',
    name: 'Todo',
    description:
      'Complete todo app setup with table, sample data, and performance indexes',
    query: SQL_TEMPLATE_QUERIES.todoComplete,
    icon: FileText,
    category: 'basic',
    difficulty: 'beginner',
  },
  {
    id: 'users-uuid-complete',
    name: 'Users',
    description:
      'User management system with UUID primary keys, sample data, and indexes',
    query: SQL_TEMPLATE_QUERIES.usersUuidComplete,
    icon: Users,
    category: 'basic',
    difficulty: 'beginner',
  },
  {
    id: 'posts-complete',
    name: 'Blog',
    description:
      'Complete blog system with authors, posts, comments, and optimized indexes',
    query: SQL_TEMPLATE_QUERIES.postsComplete,
    icon: PenTool,
    category: 'blog',
    difficulty: 'intermediate',
  },
  {
    id: 'ecommerce-basic',
    name: 'E-commerce',
    description:
      'Basic e-commerce system with products, categories, orders, and order items',
    query: SQL_TEMPLATE_QUERIES.ecommerceBasic,
    icon: TableIcon,
    category: 'ecommerce',
    difficulty: 'intermediate',
  },
  {
    id: 'analytics-events',
    name: 'Analytics',
    description:
      'Event tracking system with JSONB properties for analytics data',
    query: SQL_TEMPLATE_QUERIES.analyticsEvents,
    icon: Home01Icon,
    category: 'analytics',
    difficulty: 'advanced',
  },
]

const categoryColors = {
  basic: 'text-green-500',
  blog: 'text-blue-500',
  ecommerce: 'text-purple-500',
  analytics: 'text-orange-500',
}

interface SqlTemplatesProps {
  onSelect: (query: string, title: string) => void
  className?: string
}

export function SqlTemplates({ onSelect, className }: SqlTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const filteredTemplates = useMemo(() => {
    return sqlTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-3 border-b">
        <h3 className="font-medium">Quick Templates</h3>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mt-2 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarMenu className="space-y-0.5">
            {filteredTemplates.map((template) => (
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
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{template.name}</div>
                      {template.category && (
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full bg-muted',
                            categoryColors[template.category],
                          )}
                        >
                          {template.category}
                        </span>
                      )}
                    </div>
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
