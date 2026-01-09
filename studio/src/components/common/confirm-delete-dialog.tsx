import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      {cascadeWarning}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
