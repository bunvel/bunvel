import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteTable } from '@/hooks/mutations/useDeleteTable'
import { Edit03Icon, MoreVertical, Trash } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'

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
        <DropdownMenuTrigger render={<HugeiconsIcon icon={MoreVertical} />} />
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              toast.info('Edit table not implemented yet')
            }}
          >
            <HugeiconsIcon icon={Edit03Icon} className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setIsDeleteDialogOpen(true)
            }}
            disabled={isPending}
          >
            <HugeiconsIcon icon={Trash} className="mr-2 h-4 w-4" />
            <span>{isPending ? 'Deleting...' : 'Delete'}</span>
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
        showCascadeOption
      />
    </>
  )
}
