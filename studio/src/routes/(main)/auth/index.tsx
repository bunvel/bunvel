import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { AuthUsersTable } from '../../../components/auth/AuthUsersTable'

export const Route = createFileRoute('/(main)/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-full">
      <div className="h-full flex flex-col">
        <div className="bg-card flex items-center justify-between px-4 py-2">
          <h1 className="font-bold">Authentication Users</h1>
          <div className="flex space-x-2">
            <Button variant="outline">Add User</Button>
          </div>
        </div>

        <div className="flex-1 border overflow-hidden">
          <AuthUsersTable />
        </div>
      </div>
    </div>
  )
}
