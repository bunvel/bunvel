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
  table?: string
  schema?: string
}

export function ExportButton({ selectedRows, table, schema }: ExportButtonProps) {
  const { exportData } = useExport()

  const handleExport = (format: 'json' | 'csv' | 'sql') => {
    if (!table || !schema) return
    
    exportData(
      selectedRows, 
      `${schema}_${table}`, 
      format,
      format === 'sql' ? table : undefined
    )
    toast.success(`Exported ${selectedRows.length} rows as ${format.toUpperCase()}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="gap-1">
          <span>Export</span>
          <HugeiconsIcon icon={ArrowDown} className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        <DropdownMenuItem onSelect={() => handleExport('json')}>
          <HugeiconsIcon icon={FileJson} className="mr-2 h-4 w-4" />
          <span>Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleExport('csv')}>
          <HugeiconsIcon icon={FileText} className="mr-2 h-4 w-4" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={() => handleExport('sql')}
          disabled={!table}
        >
          <HugeiconsIcon icon={FileTypeSql} className="mr-2 h-4 w-4" />
          <span>Export as SQL</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}