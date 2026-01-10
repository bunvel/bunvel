import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useExport } from '@/hooks/use-export'
import {
  ArrowDown,
  Files as FileJson,
  File as FileText,
  Database as FileTypeSql,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

interface ExportButtonProps {
  selectedRows: any[]
  table: string
  schema: string
}

export function ExportButton({
  selectedRows,
  table,
  schema,
}: ExportButtonProps) {
  const { exportData } = useExport()

  const handleExport = async (format: 'json' | 'csv' | 'sql') => {
    const success = await exportData(selectedRows, `${schema}_${table}`, {
      format,
      tableName: table,
    })

    if (success) {
      toast.success(
        `Exported ${selectedRows.length} rows as ${format.toUpperCase()}`,
      )
    } else {
      toast.error('Export failed. Please try again.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!table || !schema || selectedRows.length === 0}
          >
            <span>Export</span>
            <HugeiconsIcon icon={ArrowDown} className="h-4 w-4" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleExport('json')
          }}
        >
          <HugeiconsIcon icon={FileJson} className="mr-2 h-4 w-4" />
          <span>Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleExport('csv')
          }}
        >
          <HugeiconsIcon icon={FileText} className="mr-2 h-4 w-4" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleExport('sql')
          }}
          disabled={!table}
        >
          <HugeiconsIcon icon={FileTypeSql} className="mr-2 h-4 w-4" />
          <span>Export as SQL</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
