import { DataTable } from '@/components/data-table/data-table'
import { AuthUser, useAuthUsers } from '@/hooks/useAuthUsers'
import { format } from 'date-fns'
import { useState } from 'react'

export const AuthUsersTable = () => {
  const { users, isLoading, totalCount, fetchUsers } = useAuthUsers()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchUsers(page, pageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    fetchUsers(1, size)
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      cell: (user: AuthUser) => user.id,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (user: AuthUser) => user.name,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (user: AuthUser) => user.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (user: AuthUser) => user.phone,
    },
    {
      key: 'created_at',
      header: 'Created at',
      cell: (user: AuthUser) =>
        format(new Date(user.created_at), 'MMM d, yyyy HH:mm'),
    },
    {
      key: 'updated_at',
      header: 'Updated at',
      cell: (user: AuthUser) =>
        format(new Date(user.updated_at), 'MMM d, yyyy HH:mm'),
    },
    {
      key: 'last_sign_in',
      header: 'Last sign in at',
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
