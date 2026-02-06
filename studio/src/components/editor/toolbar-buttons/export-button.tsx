import type { ExportFormat } from '@/constants/app'
import { BUTTON_LABELS } from '@/constants/ui'
import { useExport } from '@/hooks/use-export'
import { useTableManager } from '@/hooks/use-table-manager'
import { BaseExportButton } from '../../common/base-export-button'

export function ExportButton() {
  const { selectedRows, table, schema } = useTableManager()
  const { exportData } = useExport()

  const handleExport = async (format: ExportFormat) => {
    await exportData(selectedRows, { format, tableName: table || '' })
  }

  return (
    <BaseExportButton
      buttonLabel={BUTTON_LABELS.EXPORT}
      onAction={handleExport}
      disabled={!table || !schema || selectedRows.length === 0}
    />
  )
}
