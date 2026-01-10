import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCopy } from '@/hooks/use-copy'
import { useExport } from '@/hooks/use-export'
import {
  ArrowDown,
  Files as FileJson,
  File as FileText,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function ExportButton({ selectedRows }: { selectedRows: any[] }) {
  const { exportData } = useExport()
  const { copyRows } = useCopy()

  const handleExport = async (format: 'json' | 'csv' | 'sql') => {
    await exportData(selectedRows, {
      format,
      tableName: new Date().toISOString(),
    })
  }

  const handleCopy = async (format: 'json' | 'csv' | 'sql') => {
    await copyRows(selectedRows, {
      format,
      tableName: new Date().toISOString(),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            disabled={selectedRows.length === 0}
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
            handleCopy('json')
          }}
        >
          <HugeiconsIcon icon={FileJson} className="mr-2 h-4 w-4" />
          <span>Copy as JSON</span>
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
