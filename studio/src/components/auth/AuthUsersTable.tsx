import { DataTable } from '@/components/data-table/data-table'

interface AuthUser {
  id: string
  displayName: string
  email: string
  password: string
}

interface AuthUsersTableProps {
  users: AuthUser[]
  isLoading: boolean
  onPageChange: (page: number) => void
  currentPage: number
  onPageSizeChange: (size: number) => void
  pageSize: number
}

export const AuthUsersTable = ({
  users,
  isLoading,
  onPageChange,
  currentPage,
  onPageSizeChange,
  pageSize,
}: AuthUsersTableProps) => {
  const columns = [
    {
      key: 'id',
      header: 'ID',
      cell: (user: AuthUser) => (
        <span className="font-mono text-sm">{user.id}</span>
      ),
    },
    {
      key: 'displayName',
      header: 'Display Name',
      cell: (user: AuthUser) => user.displayName || 'N/A',
    },
    {
      key: 'email',
      header: 'Email',
      cell: (user: AuthUser) => user.email || 'N/A',
    },
    {
      key: 'password',
      header: 'Password',
      cell: () => <span className="text-muted-foreground">••••••••</span>,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      currentPage={currentPage}
      onPageChange={onPageChange}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      totalItems={users.length}
      emptyMessage="No users found"
      loadingMessage="Loading users..."
      className="h-full"
    />
  )
}
