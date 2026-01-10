import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import { Button } from '@/components/ui/button'
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
        <DropdownMenuTrigger
          render={() => (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Table actions"
              disabled={isPending}
            >
              <HugeiconsIcon icon={MoreVertical} />
            </Button>
          )}
        />
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              toast.info('Edit functionality not yet implemented', {
                description:
                  'Editing tables will be available in a future update',
              })
            }}
          >
            <HugeiconsIcon icon={Edit03Icon} />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)}>
            <HugeiconsIcon icon={Trash} />
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
