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
  SqlIcon,
  TableIcon,
  UserMultipleIcon,
  RamMemoryIcon,
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
          {/* Active Connections Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Connections
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HugeiconsIcon icon={UserMultipleIcon} className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.activeConnections ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current DB connections
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PostgreSQL Version Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PostgreSQL Version
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                <HugeiconsIcon icon={SqlIcon} className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold">
                  {stats?.pgVersion ?? 'Unknown'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Database server
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

          {/* Memory Usage Card */}
          <Card className="relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Memory Usage
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <HugeiconsIcon icon={RamMemoryIcon} className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold">
                  {formatBytes(stats?.memoryUsageBytes ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Allocated shared buffers
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
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-4"
            nativeButton={false}
            render={
              <Link to="/editor" search={{ schema: 'public' }}>
                <span className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <HugeiconsIcon icon={TableIcon} className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Table Editor</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Manage database tables
                    </div>
                  </div>
                </span>
                <HugeiconsIcon icon={ArrowRight} className="size-4 text-muted-foreground" />
              </Link>
            }
          />
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-4"
            nativeButton={false}
            render={
              <Link to="/sql">
                <span className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                    <HugeiconsIcon icon={SqlIcon} className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">SQL Editor</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Execute SQL queries
                    </div>
                  </div>
                </span>
                <HugeiconsIcon icon={ArrowRight} className="size-4 text-muted-foreground" />
              </Link>
            }
          />
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-4"
            nativeButton={false}
            render={
              <Link to="/database/schemas">
                <span className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <HugeiconsIcon icon={Database} className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Schema Diagram</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Visual database schema
                    </div>
                  </div>
                </span>
                <HugeiconsIcon icon={ArrowRight} className="size-4 text-muted-foreground" />
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
