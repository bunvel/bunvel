import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useExport } from '@/hooks/use-export'
import {
  BUTTON_LABELS,
  DROPDOWN_LABELS,
  EXPORT_FORMATS,
  ExportFormat,
} from '@/utils/constant'
import {
  ArrowDown,
  Files as FileJson,
  File as FileText,
  Database as FileTypeSql,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

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

  const handleExport = async (format: ExportFormat) => {
    await exportData(selectedRows, {
      format,
      tableName: `${schema}_${table}`,
    })
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
            <span>{BUTTON_LABELS.EXPORT}</span>
            <HugeiconsIcon icon={ArrowDown} className="h-4 w-4" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleExport(EXPORT_FORMATS.JSON)
          }}
        >
          <HugeiconsIcon icon={FileJson} className="mr-2 h-4 w-4" />
          <span>{DROPDOWN_LABELS.EXPORT_AS_JSON}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleExport(EXPORT_FORMATS.CSV)
          }}
        >
          <HugeiconsIcon icon={FileText} className="mr-2 h-4 w-4" />
          <span>{DROPDOWN_LABELS.EXPORT_AS_CSV}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleExport(EXPORT_FORMATS.SQL)
          }}
          disabled={!table}
        >
          <HugeiconsIcon icon={FileTypeSql} className="mr-2 h-4 w-4" />
          <span>{DROPDOWN_LABELS.EXPORT_AS_SQL}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
