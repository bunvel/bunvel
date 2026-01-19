import { BunvelTab } from '@/components/common/bunvel-tab'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { useSqlTabs } from '@/hooks/use-sql-tabs'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '../ui/button'

interface SqlTabProps {
  tabId: string
  title: string
  isActive: boolean
  isModified?: boolean
  onClose: (e: React.MouseEvent, tabId: string) => void
}

function SqlTab({ tabId, title, isActive, isModified, onClose }: SqlTabProps) {
  return (
    <BunvelTab
      value={tabId}
      title={title}
      isActive={isActive}
      isModified={isModified}
      onClose={onClose}
    />
  )
}

export function SqlTabs() {
  const {
    tabs,
    activeTabId,
    handleTabChange,
    handleTabClose,
    createNewQueryTab,
  } = useSqlTabs()

  if (!tabs.length) return null

  return (
    <div className="flex items-center">
      <Tabs value={activeTabId} onValueChange={handleTabChange}>
        <TabsList className="inline-flex justify-start rounded-none bg-card p-0">
          {tabs.map((tab) => (
            <SqlTab
              key={tab.id}
              tabId={tab.id}
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
