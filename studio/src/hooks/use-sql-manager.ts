import { sqlTabsActions, useSqlTabsStore } from '@/stores/sql-tabs-store'
import { sqlUiActions, useSqlUiStore } from '@/stores/sql-ui-store'
import type { QueryHistoryItem } from '@/types/components'
import type { SqlTab } from '@/types/tabs'
import { useEffect } from 'react'

export interface UseSqlManagerReturn {
  // Current tab state
  activeTab: SqlTab | null
  activeTabId: string | null
  tabs: Array<SqlTab>

  // Query state
  query: string
  setQuery: (query: string) => void

  // UI state
  showSidebar: boolean
  selectedQuery: string

  // Tab management
  addTab: (tab: SqlTab, maxTabs?: number) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabQuery: (tabId: string, query: string) => void
  updateTabExecution: (
    tabId: string,
    result: any,
    error: any,
    isExecuting: boolean,
    lastExecutedQuery: string,
  ) => void
  createNewQueryTab: () => void

  // Query history management
  queryHistory: Array<QueryHistoryItem>
  addToHistory: (query: string, success: boolean) => void
  clearHistory: () => void
  selectFromHistory: (query: string) => void

  // UI management
  setShowSidebar: (show: boolean) => void
  setSelectedQuery: (query: string) => void
  handleToggleSidebar: () => void

  // Computed helpers
  hasActiveTab: boolean
  isModified: boolean
  canExecute: boolean
}

export function useSqlManager(): UseSqlManagerReturn {
  // TanStack Store selectors
  const activeTabId = useSqlTabsStore((state) => state.activeTabId)
  const tabs = useSqlTabsStore((state) => state.tabs)
  const queryHistory = useSqlUiStore((state) => state.queryHistory)
  const showSidebar = useSqlUiStore((state) => state.showSidebar)
  const selectedQuery = useSqlUiStore((state) => state.selectedQuery)

  // Store actions
  const setActiveTabId = sqlTabsActions.setActiveTabId
  const addTab = sqlTabsActions.addTab
  const removeTab = sqlTabsActions.removeTab
  const updateTabQuery = sqlTabsActions.updateTabQuery
  const updateTabExecution = sqlTabsActions.updateTabExecution
  const createNewQueryTab = sqlTabsActions.createNewQueryTab
  const addToHistory = sqlUiActions.addToHistory
  const clearHistory = sqlUiActions.clearHistory
  const selectFromHistory = sqlUiActions.selectFromHistory
  const setShowSidebar = sqlUiActions.setShowSidebar
  const setSelectedQuery = sqlUiActions.setSelectedQuery

  // Computed values
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || null
  const query = activeTab?.query || selectedQuery || ''

  const hasActiveTab = Boolean(activeTab)
  const isModified = activeTab?.isModified || false
  const canExecute = Boolean(query.trim())

  // Tab management functions
  const handleSetActiveTab = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const handleUpdateTabQuery = (tabId: string, newQuery: string) => {
    updateTabQuery(tabId, newQuery)
  }

  const handleUpdateTabExecution = (
    tabId: string,
    result: any,
    error: any,
    isExecuting: boolean,
    lastExecutedQuery: string,
  ) => {
    updateTabExecution(tabId, result, error, isExecuting, lastExecutedQuery)
  }

  const handleRemoveTab = (tabId: string) => {
    removeTab(tabId)
  }

  // Query history functions
  const handleAddToHistory = (historyQuery: string, success: boolean) => {
    addToHistory(historyQuery, success)
  }

  const handleSelectFromHistory = (historyQuery: string) => {
    selectFromHistory(historyQuery)
  }

  // UI management functions
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const handleSetSelectedQuery = (selectedQueryValue: string) => {
    setSelectedQuery(selectedQueryValue)
  }

  // Query management
  const handleSetQuery = (newQuery: string) => {
    if (activeTab) {
      handleUpdateTabQuery(activeTab.id, newQuery)
    } else {
      handleSetSelectedQuery(newQuery)
    }
  }

  // Create default query tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      createNewQueryTab()
    }
  }, [tabs.length, createNewQueryTab])

  return {
    // Current tab state
    activeTab,
    activeTabId,
    tabs,

    // Query state
    query,
    setQuery: handleSetQuery,

    // UI state
    showSidebar,
    selectedQuery,

    // Tab management
    addTab,
    removeTab: handleRemoveTab,
    setActiveTab: handleSetActiveTab,
    updateTabQuery: handleUpdateTabQuery,
    updateTabExecution: handleUpdateTabExecution,
    createNewQueryTab,

    // Query history management
    queryHistory,
    addToHistory: handleAddToHistory,
    clearHistory,
    selectFromHistory: handleSelectFromHistory,

    // UI management
    setShowSidebar,
    setSelectedQuery: handleSetSelectedQuery,
    handleToggleSidebar,

    // Computed helpers
    hasActiveTab,
    isModified,
    canExecute,
  }
}
