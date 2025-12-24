import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: Potentially Dangerous Query</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              This query contains statements that may modify data or database structure.
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={onConfirm}>
                Execute Anyway
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

export default DangerousQueryAlert
