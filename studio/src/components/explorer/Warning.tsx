import { Link } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

export const WarningInsertRow = () => (
  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-4 rounded-r">
    <div className="flex">
      <div className="shrink-0">
        <AlertCircle className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          <strong>Note:</strong> This feature is still in development and may
          not work as expected. For more reliable data insertion, please use the
          SQL editor.{' '}
          <Link to="/sql" className="text-primary hover:underline">
            SQL Editor
          </Link>
        </p>
      </div>
    </div>
  </div>
)
