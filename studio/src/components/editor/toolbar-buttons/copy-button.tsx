import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCopy } from '@/hooks/use-copy'
import { useTableManager } from '@/hooks/use-table-manager'
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

export function CopyButton() {
  const { selectedRows, table } = useTableManager()
  const { copyRows } = useCopy()

  const handleCopy = async (format: ExportFormat) => {
    await copyRows(selectedRows, { format, tableName: table || '' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            <span>{BUTTON_LABELS.COPY}</span>
            <HugeiconsIcon icon={ArrowDown} className="h-4 w-4" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleCopy(EXPORT_FORMATS.JSON)
          }}
        >
          <HugeiconsIcon icon={FileJson} className="mr-2 h-4 w-4" />
          <span>{DROPDOWN_LABELS.COPY_AS_JSON}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleCopy(EXPORT_FORMATS.CSV)
          }}
        >
          <HugeiconsIcon icon={FileText} className="mr-2 h-4 w-4" />
          <span>{DROPDOWN_LABELS.COPY_AS_CSV}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleCopy(EXPORT_FORMATS.SQL)
          }}
          disabled={!table}
        >
          <HugeiconsIcon icon={FileTypeSql} className="mr-2 h-4 w-4" />
          <span>{DROPDOWN_LABELS.COPY_AS_SQL}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
