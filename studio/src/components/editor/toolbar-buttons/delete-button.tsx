import { ConfirmRowDeleteDialog } from '@/components/common/confirm-row-delete-dialog'
import { Button } from '@/components/ui/button'
import { useDeleteRows } from '@/hooks/mutations/useTableMutations'
import { useTableManager } from '@/hooks/use-table-manager'
import { BUTTON_LABELS } from '@/utils/constant'
import { isReadonlySchema } from '@/utils/func'
import { Trash } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'

export function DeleteButton() {
  const { selectedRows, schema, table, metadata, handleSelectionClear } =
    useTableManager()
  const deleteRowsMutation = useDeleteRows()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const isDisabled =
    !schema || !table || selectedRows.length === 0 || isReadonlySchema(schema)
  const primaryKeys = metadata?.primary_keys || []

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = () => {
    if (!schema || !table) return

    deleteRowsMutation.mutate(
      {
        schema,
        table,
        primaryKeys,
        rows: selectedRows,
      },
      {
        onSuccess: () => {
          toast.success('Rows deleted successfully')
          handleSelectionClear()
          setShowConfirmDialog(false)
        },
        onError: (error) => {
          toast.error('Failed to delete rows', {
            description:
              error instanceof Error ? error.message : 'Unknown error',
          })
          setShowConfirmDialog(false)
        },
      },
    )
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDeleteClick}
        disabled={isDisabled || deleteRowsMutation.isPending}
      >
        <HugeiconsIcon icon={Trash} className="h-4 w-4" />
        <span>
          {BUTTON_LABELS.DELETE} {selectedRows.length}{' '}
          {selectedRows.length === 1 ? 'row' : 'rows'}
        </span>
      </Button>

      <ConfirmRowDeleteDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmDelete}
        isLoading={deleteRowsMutation.isPending}
        rowCount={selectedRows.length}
        tableName={table || ''}
      />
    </>
  )
}
