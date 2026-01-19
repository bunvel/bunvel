import { Button } from '@/components/ui/button'
import type { SqlTab } from '@/contexts/sql-tabs-context'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { QueryHistory, QueryHistoryItem } from './query-history'
import { SqlTemplates } from './sql-templates'

interface SqlSidebarProps {
  isOpen: boolean
  history: QueryHistoryItem[]
  onSelect: (query: string) => void
  onClear: () => void
  onOpenInTab?: (tab: SqlTab) => void
  className?: string
}

export function SqlSidebar({
  isOpen,
  history,
  onSelect,
  onClear,
  onOpenInTab,
  className,
}: SqlSidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history')

  const handleSelectFromHistory = (query: string, title?: string) => {
    if (onOpenInTab) {
      const tab: SqlTab = {
        id: `history-${Date.now()}`,
        title: title || 'New Query',
        query,
        isModified: false,
      }
      onOpenInTab(tab)
    } else {
      onSelect(query)
    }
  }

  const handleSelectFromTemplate = (query: string, title: string) => {
    if (onOpenInTab) {
      const tab: SqlTab = {
        id: `template-${Date.now()}`,
        title: title || 'New Query',
        query,
        isModified: false,
      }
      onOpenInTab(tab)
    } else {
      onSelect(query)
    }
  }

  return (
    <div
      className={cn(
        'w-[20%] border-r transition-all duration-200 overflow-hidden bg-card flex flex-col',
        !isOpen && 'w-0 opacity-0',
        className,
      )}
    >
      <div className="flex border-b">
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 rounded-none border-0"
          onClick={() => setActiveTab('history')}
        >
          History
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 rounded-none border-0"
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'history' ? (
          <QueryHistory
            history={history}
            onSelect={(query) => handleSelectFromHistory(query)}
            onOpenInTab={(query, title) =>
              handleSelectFromHistory(query, title)
            }
            onClear={onClear}
            className="h-full"
          />
        ) : (
          <SqlTemplates
            onSelect={(query, title) => handleSelectFromTemplate(query, title)}
            onOpenInTab={(query, title) =>
              handleSelectFromTemplate(query, title)
            }
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}
