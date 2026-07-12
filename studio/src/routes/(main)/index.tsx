import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getDatabaseStats } from '@/services/project.service'
import {
  ArrowRight,
  Database,
  ListTodo,
  Search,
  SqlIcon,
  TableIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, createFileRoute } from '@tanstack/react-router'

// Helper function to format bytes nicely
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const Route = createFileRoute('/(main)/')({
  loader: async () => {
    return await getDatabaseStats()
  },
  component: Dashboard,
})

function Dashboard() {
  const stats = Route.useLoaderData()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Database Metrics Section */}
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Tables Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tables
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HugeiconsIcon icon={TableIcon} className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.tablesCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In public schema
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Rows Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Rows
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                <HugeiconsIcon icon={ListTodo} className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold">
                  {(stats?.rowsCount ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all user tables
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Database Size Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Database Size
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <HugeiconsIcon icon={Database} className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold">
                  {formatBytes(stats?.dbSizeBytes ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Postgres relation space
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Index Count Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Indexes
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <HugeiconsIcon icon={Search} className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.indexesCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active indexing rules
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common development tools and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3"
            nativeButton={false}
            render={
              <Link to="/editor" search={{ schema: 'public' }}>
                <span className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <HugeiconsIcon icon={TableIcon} className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Table Editor</div>
                    <div className="text-xs text-muted-foreground">
                      Manage database tables
                    </div>
                  </div>
                </span>
                <HugeiconsIcon icon={ArrowRight} className="size-3.5" />
              </Link>
            }
          />
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3"
            nativeButton={false}
            render={
              <Link to="/sql">
                <span className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                    <HugeiconsIcon icon={SqlIcon} className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">SQL Editor</div>
                    <div className="text-xs text-muted-foreground">
                      Execute SQL queries
                    </div>
                  </div>
                </span>
                <HugeiconsIcon icon={ArrowRight} className="size-3.5" />
              </Link>
            }
          />
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3"
            nativeButton={false}
            render={
              <Link to="/database/schemas">
                <span className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <HugeiconsIcon icon={Database} className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Schema Diagram</div>
                    <div className="text-xs text-muted-foreground">
                      Visual database schema
                    </div>
                  </div>
                </span>
                <HugeiconsIcon icon={ArrowRight} className="size-3.5" />
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
