import { Button } from '@/components/ui/button'
import { useTableManager } from '@/hooks/use-table-manager'
import { Code } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { JsonViewSheet } from '../json-view-sheet'

export function JsonViewButton() {
  const { schema, table, selectedRows, tableData } = useTableManager()

  // Show selected rows if any, otherwise show all data from tableData.data
  const dataToShow =
    selectedRows.length > 0 ? selectedRows : tableData?.data || []
  const hasData = dataToShow.length > 0

  if (!schema || !table) {
    return (
      <Button variant="outline" size="sm" className="gap-1" disabled={true}>
        <HugeiconsIcon icon={Code} className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <JsonViewSheet
      schema={schema}
      table={table}
      data={dataToShow}
      disabled={!hasData}
    />
  )
}
