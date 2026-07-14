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
    description:
      'Complete todo app setup with categories, tags, auto-increment keys, sample data, and indexes',
    query: SQL_TEMPLATE_QUERIES.todoComplete,
    icon: FileText,
  },
  {
    id: 'users-uuid-complete',
    name: 'Users',
    description:
      'User management system with roles, sessions, UUID primary keys, and sample data',
    query: SQL_TEMPLATE_QUERIES.usersUuidComplete,
    icon: Users,
  },
  {
    id: 'posts-complete',
    name: 'Blog',
    description:
      'Blog system with authors, posts, tags, comments, using UUID keys and optimized indexes',
    query: SQL_TEMPLATE_QUERIES.postsComplete,
    icon: PenTool,
  },
  {
    id: 'ecommerce-basic',
    name: 'E-commerce',
    description:
      'E-commerce system with categories, products, reviews, and orders using UUID keys',
    query: SQL_TEMPLATE_QUERIES.ecommerceBasic,
    icon: TableIcon,
  },
  {
    id: 'analytics-events',
    name: 'Analytics',
    description:
      'Event tracking system with users, sessions, schemas, using INT keys and JSONB properties',
    query: SQL_TEMPLATE_QUERIES.analyticsEvents,
    icon: Home01Icon,
  },
]
