import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteTable } from '@/hooks/mutations/useDeleteTable'
import {
  Copy01Icon,
  Edit03Icon,
  MoreVertical,
  Trash2,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SidebarMenuAction } from '../ui/sidebar'

export interface TableListActionProps {
  schema: string
  table: string
}

export function TableListAction({ schema, table }: TableListActionProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { mutate: deleteTable, isPending } = useDeleteTable()

  const handleDelete = (cascade: boolean) => {
    deleteTable({
      schema,
      table,
      cascade,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover>
              <HugeiconsIcon icon={MoreVertical} />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" side={'right'} align={'start'}>
          <DropdownMenuItem
            onClick={() => {
              toast.info('Copy functionality not yet implemented', {
                description: 'Copy will be available in a future update',
              })
            }}
          >
            <HugeiconsIcon
              icon={Copy01Icon}
              className="text-muted-foreground"
            />
            <span>Copy Name</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toast.info('Copy functionality not yet implemented', {
                description: 'Copy will be available in a future update',
              })
            }}
          >
            <HugeiconsIcon
              icon={Copy01Icon}
              className="text-muted-foreground"
            />
            <span>Copy Schema</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              toast.info('Edit functionality not yet implemented', {
                description:
                  'Editing tables will be available in a future update',
              })
            }}
          >
            <HugeiconsIcon
              icon={Edit03Icon}
              className="text-muted-foreground"
            />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <HugeiconsIcon icon={Trash2} className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Table"
        description={`Are you sure you want to delete ${schema}.${table}? This action cannot be undone.`}
        confirmText={isPending ? 'Deleting...' : 'Delete Table'}
        isLoading={isPending}
        showCascadeOption
      />
    </>
  )
}
