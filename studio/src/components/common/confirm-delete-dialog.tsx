import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Card } from '../ui/card'

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  showCascadeOption = true,
  cascadeDescription = 'Deletes the table and its dependent objects',
  cascadeWarning = 'Warning: Dropping with cascade may result in unintended consequences. All dependent objects will be removed, as will any objects that depend on them, recursively.',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (cascade: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  showCascadeOption?: boolean
  cascadeDescription?: string
  cascadeWarning?: string
}) {
  const [cascade, setCascade] = useState(false)

  const handleConfirm = () => {
    onConfirm(cascade)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <h1 className="font-bold">{description}</h1>
          {showCascadeOption && (
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    id="cascade"
                    checked={cascade}
                    onCheckedChange={setCascade}
                    aria-label="Cascade delete"
                    className="mt-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="cascade"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Drop table with cascade?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {cascadeDescription}
                  </p>
                  {cascade && (
                    <Card className="p-4 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/50">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {cascadeWarning}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
