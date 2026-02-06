import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EXPORT_FORMATS, ExportFormat } from '@/constants/app'
import { BUTTON_LABELS, DROPDOWN_LABELS } from '@/constants/ui'
import { useTableManager } from '@/hooks/use-table-manager'
import {
  ArrowDown,
  Files as FileJson,
  File as FileText,
  Database as FileTypeSql,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface BaseExportButtonProps {
  buttonLabel: string
  onAction: (format: ExportFormat) => Promise<void>
  disabled?: boolean
  variant?: 'outline' | 'ghost'
}

export function BaseExportButton({
  buttonLabel,
  onAction,
  disabled = false,
  variant = 'outline',
}: BaseExportButtonProps) {
  const { table } = useTableManager()

  const handleAction = async (format: ExportFormat) => {
    await onAction(format)
  }

  const getLabels = () => {
    if (buttonLabel === BUTTON_LABELS.COPY) {
      return {
        jsonLabel: DROPDOWN_LABELS.COPY_AS_JSON,
        csvLabel: DROPDOWN_LABELS.COPY_AS_CSV,
        sqlLabel: DROPDOWN_LABELS.COPY_AS_SQL,
      }
    } else {
      return {
        jsonLabel: DROPDOWN_LABELS.EXPORT_AS_JSON,
        csvLabel: DROPDOWN_LABELS.EXPORT_AS_CSV,
        sqlLabel: DROPDOWN_LABELS.EXPORT_AS_SQL,
      }
    }
  }

  const { jsonLabel, csvLabel, sqlLabel } = getLabels()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={variant}
            size="sm"
            className="gap-1"
            disabled={disabled}
          >
            <span>{buttonLabel}</span>
            <HugeiconsIcon icon={ArrowDown} className="h-4 w-4" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleAction(EXPORT_FORMATS.JSON)
          }}
        >
          <HugeiconsIcon icon={FileJson} className="mr-2 h-4 w-4" />
          <span>{jsonLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleAction(EXPORT_FORMATS.CSV)
          }}
        >
          <HugeiconsIcon icon={FileText} className="mr-2 h-4 w-4" />
          <span>{csvLabel}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleAction(EXPORT_FORMATS.SQL)
          }}
          disabled={!table}
        >
          <HugeiconsIcon icon={FileTypeSql} className="mr-2 h-4 w-4" />
          <span>{sqlLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
