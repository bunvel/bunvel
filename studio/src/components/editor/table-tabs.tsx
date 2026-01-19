import { BunvelTab } from '@/components/common/bunvel-tab'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { useTableTabs } from '@/hooks/use-table-tabs'

export function TableTabs() {
  const { selectedTables, activeTable, handleTabChange, handleTabClose } =
    useTableTabs()

  if (!selectedTables.length) return null

  return (
    <Tabs value={activeTable} onValueChange={handleTabChange}>
      <TabsList className="inline-flex justify-start rounded-none bg-card p-0">
        {selectedTables.map((tableKey) => (
          <BunvelTab
            key={tableKey}
            value={tableKey}
            title={tableKey}
            isActive={activeTable === tableKey}
            onClose={handleTabClose}
          />
        ))}
      </TabsList>
    </Tabs>
  )
}
