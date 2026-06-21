import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FOREIGN_KEY_ACTIONS } from '@/constants/database'
import { useEffect, useState } from 'react'

interface SchemaForeignKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connection: {
    sourceTable: string
    sourceColumn: string
    targetTable: string
    targetColumn: string
    schema: string
  } | null
  onConfirm: (
    constraintName: string,
    onDelete: string,
    onUpdate: string,
  ) => void
  isPending: boolean
}

export function SchemaForeignKeyDialog({
  open,
  onOpenChange,
  connection,
  onConfirm,
  isPending,
}: SchemaForeignKeyDialogProps) {
  const [constraintName, setConstraintName] = useState('')
  const [onDelete, setOnDelete] = useState('NO ACTION')
  const [onUpdate, setOnUpdate] = useState('NO ACTION')

  useEffect(() => {
    if (connection) {
      const srcT =
        connection.sourceTable.split('.').pop() || connection.sourceTable
      const tgtT =
        connection.targetTable.split('.').pop() || connection.targetTable
      setConstraintName(`fk_${srcT}_${connection.sourceColumn}_ref_${tgtT}`)
      setOnDelete('NO ACTION')
      setOnUpdate('NO ACTION')
    }
  }, [connection])

  if (!connection) return null

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!constraintName.trim()) return
    onConfirm(constraintName.trim(), onDelete, onUpdate)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Foreign Key Relationship</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/40 border text-xs">
            <div>
              <span className="font-semibold text-muted-foreground block mb-1">
                SOURCE COLUMN
              </span>
              <span className="font-medium text-foreground block">
                {connection.sourceTable}.{connection.sourceColumn}
              </span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block mb-1">
                REFERENCES
              </span>
              <span className="font-medium text-foreground block">
                {connection.targetTable}.{connection.targetColumn}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="constraint-name">Constraint Name</Label>
            <Input
              id="constraint-name"
              value={constraintName}
              onChange={(e) => setConstraintName(e.target.value)}
              placeholder="e.g. fk_table_col"
              required
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>ON DELETE Action</Label>
              <Select
                value={onDelete}
                onValueChange={(val) => setOnDelete(val || 'NO ACTION')}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOREIGN_KEY_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>ON UPDATE Action</Label>
              <Select
                value={onUpdate}
                onValueChange={(val) => setOnUpdate(val || 'NO ACTION')}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOREIGN_KEY_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !constraintName.trim()}
            >
              {isPending ? 'Creating...' : 'Create Relationship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
