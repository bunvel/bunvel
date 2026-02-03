import { BaseExportButton } from '@/components/common/base-export-button'
import { useCopy } from '@/hooks/use-copy'
import { useExport } from '@/hooks/use-export'
import { BUTTON_LABELS, ExportFormat } from '@/utils/constant'

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
