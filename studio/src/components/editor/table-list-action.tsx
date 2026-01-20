import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteTable } from '@/hooks/mutations/useDeleteTable'
import { useTruncateTable } from '@/hooks/mutations/useTruncateTable'
import { useCopyToClipboard } from '@/hooks/use-clipboard'
import { useTableTabs } from '@/hooks/use-table-tabs'
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
  const [isTruncateDialogOpen, setIsTruncateDialogOpen] = useState(false)
  const { removeTableBySchema } = useTableTabs()
  const { mutate: deleteTable, isPending: isDeleting } = useDeleteTable({
    onTableDeleted: (deletedSchema, deletedTable) => {
      removeTableBySchema(deletedSchema, deletedTable)
    },
  })
  const { mutate: truncateTable, isPending: isTruncating } = useTruncateTable()
  const [, copyToClipboard] = useCopyToClipboard()

  const handleDelete = (cascade: boolean) => {
    deleteTable({
      schema,
      table,
      cascade,
    })
  }

  const handleTruncate = () => {
    truncateTable({
      schema,
      table,
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
            onClick={async () => {
              const success = await copyToClipboard(table)
              if (success) {
                toast.success('Table name copied')
              }
            }}
          >
            <HugeiconsIcon
              icon={Copy01Icon}
              className="text-muted-foreground"
            />
            <span>Copy Name</span>
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
          <DropdownMenuItem onClick={() => setIsTruncateDialogOpen(true)}>
            <HugeiconsIcon icon={Trash2} className="text-muted-foreground" />
            <span>Truncate</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <HugeiconsIcon icon={Trash2} className="text-destructive" />
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
        confirmText={isDeleting ? 'Deleting...' : 'Delete Table'}
        isLoading={isDeleting}
        showCascadeOption
      />
      <ConfirmDeleteDialog
        open={isTruncateDialogOpen}
        onOpenChange={setIsTruncateDialogOpen}
        onConfirm={() => handleTruncate()}
        title="Truncate Table"
        description={`Are you sure you want to truncate ${schema}.${table}? This will remove all rows from the table but keep the table structure. This action cannot be undone.`}
        confirmText={isTruncating ? 'Truncating...' : 'Truncate Table'}
        isLoading={isTruncating}
        showCascadeOption={false}
      />
    </>
  )
}
