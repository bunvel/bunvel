import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { FileText, Users } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

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
    query: `-- Create todos table
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO todos (title, description, completed) VALUES
  ('Buy groceries', 'Milk, eggs, bread, and vegetables', FALSE),
  ('Finish project', 'Complete the SQL template feature', TRUE),
  ('Call mom', 'Remember to call mom this weekend', FALSE),
  ('Workout', 'Go to the gym for 30 minutes', FALSE);

-- Create indexes for performance
CREATE INDEX idx_todos_title ON todos(title);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at);`,
    icon: FileText,
  },
  {
    id: 'users-complete',
    name: 'Users - Complete Setup',
    description: 'Create table, insert sample data, and add indexes',
    category: 'User Management',
    query: `-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
  ('john_doe', 'john@example.com', 'hashed_password_1', 'John', 'Doe'),
  ('jane_smith', 'jane@example.com', 'hashed_password_2', 'Jane', 'Smith'),
  ('bob_wilson', 'bob@example.com', 'hashed_password_3', 'Bob', 'Wilson');

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);`,
    icon: Users,
  },
  {
    id: 'posts-complete',
    name: 'Posts - Complete Setup',
    description: 'Create table, insert sample data, and add indexes',
    category: 'Posts',
    query: `-- Create posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO posts (title, content, author_id, status, published_at) VALUES
  ('My First Blog Post', 'This is the content of my very first blog post. I''m excited to start writing!', 1, 'published', CURRENT_TIMESTAMP),
  ('SQL Tips and Tricks', 'Learn some amazing SQL techniques that will make your life easier.', 2, 'published', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('Draft Article', 'This is still a work in progress...', 1, 'draft', NULL),
  ('Database Design Best Practices', 'A comprehensive guide to designing efficient databases.', 3, 'published', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Create indexes for performance
CREATE INDEX idx_posts_title ON posts(title);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);`,
    icon: FileText,
  },
]

interface SqlTemplatesProps {
  onSelect: (query: string) => void
  className?: string
}

export function SqlTemplates({ onSelect, className }: SqlTemplatesProps) {
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
                    <SidebarMenuButton
                      className="w-full justify-start h-auto py-1.5 px-2 hover:bg-accent/50"
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
