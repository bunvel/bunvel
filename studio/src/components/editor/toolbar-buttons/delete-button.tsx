import { ConfirmRowDeleteDialog } from '@/components/common/confirm-row-delete-dialog'
import { Button } from '@/components/ui/button'
import { useDeleteRows } from '@/hooks/mutations/useTableMutations'
import { BUTTON_LABELS } from '@/utils/constant'
import { Trash } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteButtonProps {
  selectRows: any[]
  disabled?: boolean
  schema: string
  table: string
  primaryKeys: string[]
  onSelectionClear?: () => void
}

export function DeleteButton({
  selectRows,
  disabled = false,
  schema,
  table,
  primaryKeys,
  onSelectionClear,
}: DeleteButtonProps) {
  const deleteRowsMutation = useDeleteRows()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleDeleteClick = () => {
    if (primaryKeys.length === 0) {
      toast.error('Cannot delete rows', {
        description: 'Table has no primary keys defined',
      })
      return
    }

    // Check if all selected rows have primary key values
    const rowsWithoutPk = selectRows.filter(
      (row) =>
        !primaryKeys.every(
          (pk) => row[pk] !== null && row[pk] !== undefined && row[pk] !== '',
        ),
    )

    if (rowsWithoutPk.length > 0) {
      toast.error('Cannot delete rows', {
        description: 'Some selected rows are missing primary key values',
      })
      return
    }

    // Show confirmation dialog
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = () => {
    deleteRowsMutation.mutate(
      {
        schema,
        table,
        primaryKeys,
        rows: selectRows,
      },
      {
        onSuccess: () => {
          // Clear selection after successful deletion
          onSelectionClear?.()
          setShowConfirmDialog(false)
        },
        onError: () => {
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
        disabled={disabled || deleteRowsMutation.isPending}
      >
        <HugeiconsIcon icon={Trash} className="h-4 w-4" />
        <span>
          {BUTTON_LABELS.DELETE} {selectRows.length}{' '}
          {selectRows.length === 1 ? 'row' : 'rows'}
        </span>
      </Button>

      <ConfirmRowDeleteDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmDelete}
        isLoading={deleteRowsMutation.isPending}
        rowCount={selectRows.length}
        tableName={table}
      />
    </>
  )
}
