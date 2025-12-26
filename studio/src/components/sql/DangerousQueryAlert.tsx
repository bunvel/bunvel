import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ShieldAlert } from 'lucide-react'

interface DangerousQueryAlertProps {
  isDangerous: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const DangerousQueryAlert = ({
  isDangerous,
  onConfirm,
  onCancel,
}: DangerousQueryAlertProps) => {
  if (!isDangerous) return null

  return (
    <Dialog open={isDangerous} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header with border */}
        <div className="bg-muted/30 border-b border-border/40">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Potentially Dangerous Query
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>
        
        {/* Content Area */}
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-foreground font-medium">Warning</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>This query may modify data or database structure</li>
              <li>Proceeding may cause unintended changes to your database</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to execute this query?
          </p>
        </div>
        
        {/* Footer with border */}
        <div className="bg-muted/30 border-t border-border/40 px-6 py-4">
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="px-4"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              className="px-6 bg-red-600 hover:bg-red-700"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Execute Anyway
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DangerousQueryAlert
