import { useSqlTabsContext } from '@/contexts/sql-tabs-context'
import { useCallback } from 'react'

import type { SqlTab } from '@/contexts/sql-tabs-context'

interface UseSqlTabsOptions {
  maxTabs?: number
}

interface UseSqlTabsReturn {
  tabs: SqlTab[]
  activeTab: SqlTab | undefined
  activeTabId: string | undefined
  handleTabChange: (tabId: string) => void
  handleTabClose: (e: React.MouseEvent, tabId: string) => void
  removeTab: (tabId: string) => void
  addTab: (tab: SqlTab) => void
  updateTabQuery: (tabId: string, query: string) => void
  updateTabExecution: (tabId: string, result: any, error: any, isExecuting: boolean, lastExecutedQuery: string) => void
  createNewQueryTab: () => void
}

export function useSqlTabs(options: UseSqlTabsOptions = {}): UseSqlTabsReturn {
  const { maxTabs = 10 } = options
  const { 
    tabs, 
    activeTabId, 
    addTab: contextAddTab, 
    removeTab: contextRemoveTab, 
    setActiveTab, 
    updateTabQuery: contextUpdateTabQuery,
    updateTabExecution: contextUpdateTabExecution,
    createNewQueryTab: contextCreateNewQueryTab,
  } = useSqlTabsContext()

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [setActiveTab])

  const removeTab = useCallback((tabId: string) => {
    contextRemoveTab(tabId)
  }, [contextRemoveTab])

  const handleTabClose = useCallback((e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    removeTab(tabId)
  }, [removeTab])

  const addTab = useCallback((tab: SqlTab) => {
    contextAddTab(tab, maxTabs)
  }, [contextAddTab, maxTabs])

  const updateTabQuery = useCallback((tabId: string, query: string) => {
    contextUpdateTabQuery(tabId, query)
  }, [contextUpdateTabQuery])

  const updateTabExecution = useCallback((
    tabId: string, 
    result: any, 
    error: any, 
    isExecuting: boolean, 
    lastExecutedQuery: string
  ) => {
    contextUpdateTabExecution(tabId, result, error, isExecuting, lastExecutedQuery)
  }, [contextUpdateTabExecution])

  const createNewQueryTab = useCallback(() => {
    contextCreateNewQueryTab()
  }, [contextCreateNewQueryTab])

  return {
    tabs,
    activeTab,
    activeTabId,
    handleTabChange,
    handleTabClose,
    removeTab,
    addTab,
    updateTabQuery,
    updateTabExecution,
    createNewQueryTab,
  }
}
