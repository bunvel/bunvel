// In /studio/src/components/auth/AuthUsersTable.tsx
import { DataTable } from '@/components/data-table/data-table'
import { useAuthUsers } from '@/hooks/useAuthUsers'
import { format } from 'date-fns'
import { useState } from 'react'

interface AuthUser {
  id: string
  email: string | null
  phone: string | null
  email_confirmed: boolean
  phone_confirmed: boolean
  provider: string
  providers: Record<string, any>
  user_metadata: Record<string, any>
  app_metadata: Record<string, any>
  last_sign_in_at: string | null
  banned_until: string | null
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export const AuthUsersTable = () => {
  const { users, isLoading, totalCount, fetchUsers } = useAuthUsers()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchUsers(page, pageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    fetchUsers(1, size)
  }

  // In AuthUsersTable.tsx, update the columns definition
  const columns = [
    {
      key: 'email',
      header: 'Email',
      cell: (user: AuthUser) => (
        <div className="flex items-center gap-2">
          {user.email || 'N/A'}
          {user.email_confirmed && (
            <span className="text-xs text-green-600">✓</span>
          )}
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      cell: (user: AuthUser) => (
        <div className="flex items-center gap-1">
          {user.provider}
          {user.providers && (
            <span className="text-xs text-gray-500">
              (
              {Object.keys(user.providers)
                .filter((k) => user.providers[k])
                .join(', ')}
              )
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user: AuthUser) => (
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              user.banned_until
                ? 'bg-red-500'
                : user.is_anonymous
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
          />
          {user.banned_until
            ? 'Banned'
            : user.is_anonymous
              ? 'Anonymous'
              : 'Active'}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (user: AuthUser) =>
        format(new Date(user.created_at), 'MMM d, yyyy'),
    },
    {
      key: 'last_sign_in',
      header: 'Last Active',
      cell: (user: AuthUser) =>
        user.last_sign_in_at
          ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy HH:mm')
          : 'Never',
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      totalItems={totalCount}
      emptyMessage="No users found"
      loadingMessage="Loading users..."
      className="h-full"
    />
  )
}
