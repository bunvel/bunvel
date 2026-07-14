import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuAction } from '@/components/ui/sidebar'
import { useDeleteTable } from '@/hooks/mutations/useDeleteTable'
import { useTruncateTable } from '@/hooks/mutations/useTruncateTable'
import { useCopyToClipboard } from '@/hooks/use-clipboard'
import type { TableListActionProps } from '@/types/components'
import { Copy01Icon, MoreVertical, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

export function TableListAction({ schema, table, kind }: TableListActionProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isTruncateDialogOpen, setIsTruncateDialogOpen] = useState(false)
  const { mutateAsync: deleteTableAsync, isPending: isDeleting } =
    useDeleteTable()
  const { mutate: truncateTable, isPending: isTruncating } = useTruncateTable()
  const [, copyToClipboard] = useCopyToClipboard()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { table?: string; schema?: string }

  const handleDelete = async (cascade: boolean) => {
    try {
      await deleteTableAsync({
        schema,
        table,
        cascade,
        kind,
      })
      if (search.table === table) {
        navigate({ search: { schema: search.schema } as any })
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete table. Please try again.'
      toast.error(message)
      throw error
    }
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
          {kind === 'TABLE' && (
            <DropdownMenuItem onClick={() => setIsTruncateDialogOpen(true)}>
              <HugeiconsIcon
                icon={Trash2}
                className="text-muted-foreground"
              />
              <span>Truncate Table</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <HugeiconsIcon icon={Trash2} className="text-destructive" />
            <span>Delete {kind === 'VIEW' || kind === 'MATERIALIZED VIEW' ? 'View' : 'Table'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={`Delete ${kind === 'VIEW' || kind === 'MATERIALIZED VIEW' ? 'View' : 'Table'}`}
        description={`Are you sure you want to delete ${schema}.${table}? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : `Delete ${kind === 'VIEW' || kind === 'MATERIALIZED VIEW' ? 'View' : 'Table'}`}
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
