import { useCopy } from '@/hooks/use-copy'
import { useTableManager } from '@/hooks/use-table-manager'
import { BUTTON_LABELS, ExportFormat } from '@/utils/constant'
import { BaseExportButton } from '../../common/base-export-button'

export function CopyButton() {
  const { selectedRows, table } = useTableManager()
  const { copyRows } = useCopy()

  const handleCopy = async (format: ExportFormat) => {
    await copyRows(selectedRows, { format, tableName: table || '' })
  }

  return (
    <BaseExportButton buttonLabel={BUTTON_LABELS.COPY} onAction={handleCopy} />
  )
}
