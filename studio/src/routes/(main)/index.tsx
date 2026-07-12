import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDatabaseStats } from '@/hooks/queries/useDatabaseStats'
import {
  ArrowRight,
  Cancel01Icon,
  Database,
  Info,
  ListTodo,
  Loading03Icon,
  Search,
  SqlIcon,
  TableIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

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
  component: Dashboard,
})

function Dashboard() {
  const [showNotice, setShowNotice] = useState(true)
  const { data: stats, isLoading: statsLoading } = useDatabaseStats()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview and quick management of your Bunvel backend.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      {showNotice && (
        <div className="relative rounded-xl border border-amber-500/20 bg-amber-50/40 p-5 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200 backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => setShowNotice(false)}
            className="absolute top-4 right-4 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors p-1 rounded-md hover:bg-amber-500/10"
            aria-label="Close notice"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <HugeiconsIcon icon={Info} className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-amber-800 dark:text-amber-300">
                🚧 Bunvel Early Development Stage
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed max-w-3xl">
                Bunvel is a fast, lightweight open-source Backend-as-a-Service
                (BaaS) built with Elysia and Bun. This project is currently in
                early development. All contributions, ideas, and issues are
                welcomed on GitHub!
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium">
                <span className="flex items-center gap-1">
                  ✨ <strong>Status:</strong> Early Dev
                </span>
                <span className="flex items-center gap-1">
                  🎯 <strong>Focus:</strong> Database & REST API explorer
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
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
            {statsLoading ? (
              <div className="h-8 flex items-center">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin text-muted-foreground"
                />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  {stats?.tablesCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In public schema
                </p>
              </div>
            )}
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
            {statsLoading ? (
              <div className="h-8 flex items-center">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin text-muted-foreground"
                />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  {(stats?.rowsCount ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all user tables
                </p>
              </div>
            )}
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
            {statsLoading ? (
              <div className="h-8 flex items-center">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin text-muted-foreground"
                />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  {formatBytes(stats?.dbSizeBytes ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Postgres relation space
                </p>
              </div>
            )}
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
            {statsLoading ? (
              <div className="h-8 flex items-center">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin text-muted-foreground"
                />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  {stats?.indexesCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active indexing rules
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions Card (1/3 width) */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common development links and shortcuts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full justify-between"
              render={
                <Link to="/editor" search={{ schema: 'public' }}>
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={TableIcon}
                      className="size-4 text-blue-500"
                    />
                    Table Editor
                  </span>
                  <HugeiconsIcon icon={ArrowRight} className="size-3.5" />
                </Link>
              }
            />
            <Button
              variant="outline"
              className="w-full justify-between"
              render={
                <Link to="/sql">
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={SqlIcon}
                      className="size-4 text-green-500"
                    />
                    SQL Editor
                  </span>
                  <HugeiconsIcon icon={ArrowRight} className="size-3.5" />
                </Link>
              }
            />
            <Button
              variant="outline"
              className="w-full justify-between"
              render={
                <Link to="/database/schemas">
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Database}
                      className="size-4 text-purple-500"
                    />
                    Schema Diagram
                  </span>
                  <HugeiconsIcon icon={ArrowRight} className="size-3.5" />
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
