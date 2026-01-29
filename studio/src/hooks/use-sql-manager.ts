import { useSqlStore } from '@/stores/sql-store'
import type { QueryHistoryItem, SqlTab } from '@/types'
import { useEffect } from 'react'

export interface UseSqlManagerReturn {
  // Current tab state
  activeTab: SqlTab | null
  activeTabId: string | null
  tabs: SqlTab[]

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
  queryHistory: QueryHistoryItem[]
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
  // Zustand store selectors
  const activeTabId = useSqlStore((state) => state.activeTabId)
  const tabs = useSqlStore((state) => state.tabs)
  const queryHistory = useSqlStore((state) => state.queryHistory)
  const showSidebar = useSqlStore((state) => state.showSidebar)
  const selectedQuery = useSqlStore((state) => state.selectedQuery)

  // Store actions
  const setActiveTabId = useSqlStore((state) => state.setActiveTabId)
  const addTab = useSqlStore((state) => state.addTab)
  const removeTab = useSqlStore((state) => state.removeTab)
  const updateTabQuery = useSqlStore((state) => state.updateTabQuery)
  const updateTabExecution = useSqlStore((state) => state.updateTabExecution)
  const createNewQueryTab = useSqlStore((state) => state.createNewQueryTab)
  const addToHistory = useSqlStore((state) => state.addToHistory)
  const clearHistory = useSqlStore((state) => state.clearHistory)
  const selectFromHistory = useSqlStore((state) => state.selectFromHistory)
  const setShowSidebar = useSqlStore((state) => state.setShowSidebar)
  const setSelectedQuery = useSqlStore((state) => state.setSelectedQuery)

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
  const handleAddToHistory = (query: string, success: boolean) => {
    addToHistory(query, success)
  }

  const handleSelectFromHistory = (query: string) => {
    selectFromHistory(query)
  }

  // UI management functions
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const handleSetSelectedQuery = (query: string) => {
    setSelectedQuery(query)
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
