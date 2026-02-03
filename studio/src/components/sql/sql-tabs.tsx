import { BunvelTab } from '@/components/common/bunvel-tab'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'

export function SqlTabs() {
  const { tabs, activeTabId, setActiveTab, removeTab, createNewQueryTab } =
    useSqlManager()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleTabClose = (e: React.MouseEvent, value: string) => {
    e.stopPropagation()
    removeTab(value)
  }

  if (!tabs.length) return null

  return (
    <div className="flex items-center">
      <Tabs value={activeTabId || ''} onValueChange={handleTabChange}>
        <TabsList className="inline-flex justify-start rounded-none bg-card p-0">
          {tabs.map((tab) => (
            <BunvelTab
              key={tab.id}
              value={tab.id}
              title={tab.title}
              isActive={activeTabId === tab.id}
              isModified={tab.isModified}
              onClose={handleTabClose}
            />
          ))}
        </TabsList>
      </Tabs>
      <Button
        variant="ghost"
        onClick={createNewQueryTab}
        title="New Query Tab"
        className="rounded-none"
      >
        <HugeiconsIcon icon={Plus} />
      </Button>
    </div>
  )
}
