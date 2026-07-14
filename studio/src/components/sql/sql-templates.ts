import type { SqlTemplate } from '@/types/components'
import { SQL_TEMPLATE_QUERIES } from '@/utils/sql/sql-template-queries'
import {
  FileText,
  Home01Icon,
  PenTool,
  TableIcon,
  Users,
} from '@hugeicons/core-free-icons'

export const sqlTemplates: Array<SqlTemplate> = [
  {
    id: 'todo-complete',
    name: 'Todo',
    query: SQL_TEMPLATE_QUERIES.todoComplete,
    icon: FileText,
  },
  {
    id: 'users-uuid-complete',
    name: 'Users',
    query: SQL_TEMPLATE_QUERIES.usersUuidComplete,
    icon: Users,
  },
  {
    id: 'posts-complete',
    name: 'Blog',
    query: SQL_TEMPLATE_QUERIES.postsComplete,
    icon: PenTool,
  },
  {
    id: 'ecommerce-basic',
    name: 'E-commerce',
    query: SQL_TEMPLATE_QUERIES.ecommerceBasic,
    icon: TableIcon,
  },
  {
    id: 'analytics-events',
    name: 'Analytics',
    query: SQL_TEMPLATE_QUERIES.analyticsEvents,
    icon: Home01Icon,
  },
]
