import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthUser, useAuthUsers } from '@/hooks/useAuthUsers'
import { createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Copy, Trash, X } from 'lucide-react'
import { useState } from 'react'

export const AuthUsersTable = () => {
  const { users, isLoading, totalCount, fetchUsers }: { users: AuthUser[], isLoading: boolean, totalCount: number, fetchUsers: (page: number, size: number) => void } = useAuthUsers()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchUsers(page, pageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    fetchUsers(1, size)
  }

  const columnHelper = createColumnHelper<AuthUser>()

  const columns = [
    columnHelper.display({
      id: 'select',
      meta: { key: 'select', className: 'w-12' },
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 40,
    }),
    columnHelper.accessor('id', {
      id: 'id',
      meta: { key: 'id', className: 'w-24' },
      header: 'ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('name', {
      id: 'name',
      meta: { key: 'name' },
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
      id: 'email',
      meta: { key: 'email' },
      header: 'Email',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('phone', {
      id: 'phone',
      meta: { key: 'phone', className: 'w-32' },
      header: 'Phone',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('created_at', {
      id: 'created_at',
      meta: { key: 'created_at', className: 'w-40' },
      header: 'Created at',
      cell: (info) => format(new Date(info.getValue()), 'MMM d, yyyy HH:mm'),
    }),
    columnHelper.accessor('updated_at', {
      id: 'updated_at',
      meta: { key: 'updated_at', className: 'w-40' },
      header: 'Updated at',
      cell: (info) => format(new Date(info.getValue()), 'MMM d, yyyy HH:mm'),
    }),
    columnHelper.accessor('last_sign_in_at', {
      id: 'last_sign_in_at',
      meta: { key: 'last_sign_in_at', className: 'w-40' },
      header: 'Last sign in at',
      cell: (info) => 
        info.getValue() 
          ? format(new Date(info.getValue() as string), 'MMM d, yyyy HH:mm')
          : 'Never',
    }),
  ]

  const hasSelectedRows = Object.keys(rowSelection).length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-card flex items-center justify-between px-2 py-2">
        {hasSelectedRows ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} selected
            </span>
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
                <X/> Clear
              </Button>
              <div className="h-4 w-px bg-border"/>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  // Handle delete action
                  console.log('Delete selected:', Object.keys(rowSelection));
                }}
              >
                <Trash/> Delete
              </Button>
              <div className="h-4 w-px bg-border"/>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  // Handle copy action
                  const selectedUsers = Object.keys(rowSelection).map(
                    (rowIndex) => users[parseInt(rowIndex)]
                  );
                  console.log('Copy selected:', selectedUsers);
                  // You can implement copy to clipboard logic here
                }}
              >
                <Copy/> Copy
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            size="sm" 
            onClick={() => {
              // Handle add user action
              console.log('Add new user');
            }}
          >
            Add User
          </Button>
        )}
      </div>
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
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
    </div>
  )
}
