import { BunvelTab } from '@/components/common/bunvel-tab'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { useTableManager } from '@/hooks/use-table-manager'

export function TableTabs() {
  const { selectedTables, activeTable, handleTabChange, handleTabClose } =
    useTableManager()

  if (!selectedTables.length) return null

  // Ensure Tabs always has a controlled value
  const tabsValue = activeTable || selectedTables[0] || ''

  return (
    <Tabs value={tabsValue} onValueChange={handleTabChange}>
      <TabsList className="inline-flex justify-start rounded-none bg-card p-0">
        {selectedTables.map((tableKey) => (
          <BunvelTab
            key={tableKey}
            value={tableKey}
            title={tableKey}
            isActive={tabsValue === tableKey}
            onClose={handleTabClose}
          />
        ))}
      </TabsList>
    </Tabs>
  )
}
