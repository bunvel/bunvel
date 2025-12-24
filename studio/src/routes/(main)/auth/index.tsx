
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthUsersTable } from '../../../components/auth/AuthUsersTable'

interface AuthUser {
  id: string
  displayName: string
  email: string
  password: string
}

// Sample data - replace with actual data fetching in a real app
const sampleUsers: AuthUser[] = [
  {
    id: 'user_123',
    displayName: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password_123'
  },
  {
    id: 'user_456',
    displayName: 'Jane Smith',
    email: 'jane@example.com',
    password: 'hashed_password_456'
  },
  {
    id: 'user_789',
    displayName: 'Admin User',
    email: 'admin@example.com',
    password: 'hashed_admin_pass'
  }
]

export const Route = createFileRoute('/(main)/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // In a real app, you would fetch the new page of data here
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
    // In a real app, you would refetch data with the new page size
  }

  return (
    <div className="h-full">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mx-4 my-2">
          <h1 className="font-bold">Authentication Users</h1>
          <div className="flex space-x-2">
            <Button variant="outline">
              Add User
            </Button>
            <Button variant="secondary">
              Import
            </Button>
          </div>
        </div>
        
        <div className="flex-1 border overflow-hidden">
          <AuthUsersTable
            users={sampleUsers}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            currentPage={currentPage}
            onPageSizeChange={handlePageSizeChange}
            pageSize={pageSize}
          />
        </div>
      </div>
    </div>
  )
}
