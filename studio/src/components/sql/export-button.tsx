import { BaseExportButton } from '@/components/common/base-export-button'
import { ExportFormat } from '@/constants/app'
import { BUTTON_LABELS } from '@/constants/ui'
import { useCopy } from '@/hooks/use-copy'
import { useExport } from '@/hooks/use-export'

export function ExportButton({ selectedRows }: { selectedRows: any[] }) {
  const { exportData } = useExport()
  const { copyRows } = useCopy()

  const handleExport = async (format: ExportFormat) => {
    await exportData(selectedRows, {
      format,
      tableName: new Date().toISOString(),
    })
  }

  const handleCopy = async (format: ExportFormat) => {
    await copyRows(selectedRows, {
      format,
      tableName: new Date().toISOString(),
    })
  }

  return (
    <div className="flex gap-2">
      <BaseExportButton
        buttonLabel={BUTTON_LABELS.COPY}
        onAction={handleCopy}
        disabled={selectedRows.length === 0}
        variant="ghost"
      />
      <span className="text-muted">|</span>
      <BaseExportButton
        buttonLabel={BUTTON_LABELS.EXPORT}
        onAction={handleExport}
        disabled={selectedRows.length === 0}
        variant="ghost"
      />
    </div>
  )
}
