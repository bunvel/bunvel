import { logger } from '@/lib/logger'
import type { QueryHistoryItem, SqlTab } from '@/types'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Local storage keys
const QUERY_HISTORY_KEY = 'bunvel-query-history'

// Load query history from localStorage
const loadQueryHistory = (): QueryHistoryItem[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(QUERY_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    logger.error(
      'Failed to load query history from localStorage',
      'sql-store',
      error,
    )
    return []
  }
}

// Save query history to localStorage
const saveQueryHistory = (history: QueryHistoryItem[]) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    logger.error(
      'Failed to save query history to localStorage',
      'sql-store',
      error,
    )
  }
}

export interface SqlStore {
  // SQL tabs state
  tabs: SqlTab[]
  activeTabId: string | null

  // Query history state
  queryHistory: QueryHistoryItem[]

  // UI state
  showSidebar: boolean
  selectedQuery: string

  // Tab actions
  setTabs: (tabs: SqlTab[]) => void
  setActiveTabId: (tabId: string | null) => void
  addTab: (tab: SqlTab, maxTabs?: number) => void
  removeTab: (tabId: string) => void
  updateTabQuery: (tabId: string, query: string) => void
  updateTabExecution: (
    tabId: string,
    result: any,
    error: any,
    isExecuting: boolean,
    lastExecutedQuery: string,
  ) => void
  createNewQueryTab: () => void

  // Query history actions
  setQueryHistory: (history: QueryHistoryItem[]) => void
  addToHistory: (query: string, success: boolean) => void
  clearHistory: () => void
  selectFromHistory: (query: string) => void

  // UI actions
  setShowSidebar: (show: boolean) => void
  setSelectedQuery: (query: string) => void
}

export const useSqlStore = create<SqlStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    tabs: [],
    activeTabId: null,
    queryHistory: loadQueryHistory(), // Load from localStorage
    showSidebar: true,
    selectedQuery: '',

    // Tab actions
    setTabs: (tabs: SqlTab[]) => {
      set({ tabs })
    },

    setActiveTabId: (tabId: string | null) => {
      set({ activeTabId: tabId })
    },

    addTab: (tab: SqlTab, maxTabs = 10) => {
      set((prev) => {
        // Check if tab with same query already exists
        const existingTab = prev.tabs.find((t) => t.query === tab.query)
        if (existingTab) {
          // Switch to existing tab instead of creating duplicate
          return { activeTabId: existingTab.id }
        }

        const newTabs = [...prev.tabs, tab]
        const finalTabs =
          newTabs.length > maxTabs ? newTabs.slice(-maxTabs) : newTabs

        return {
          tabs: finalTabs,
          activeTabId: tab.id,
        }
      })
    },

    removeTab: (tabId: string) => {
      set((prev) => {
        const newTabs = prev.tabs.filter((t) => t.id !== tabId)
        let newActiveTabId = prev.activeTabId

        // If removing active tab, set new active tab
        if (prev.activeTabId === tabId && newTabs.length > 0) {
          const currentIndex = prev.tabs.findIndex((t) => t.id === tabId)
          const nextIndex = Math.min(currentIndex, newTabs.length - 1)
          newActiveTabId = newTabs[nextIndex].id
        } else if (newTabs.length === 0) {
          newActiveTabId = null
        }

        return {
          tabs: newTabs,
          activeTabId: newActiveTabId,
        }
      })
    },

    updateTabQuery: (tabId: string, query: string) => {
      set((prev) => ({
        tabs: prev.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, query, isModified: true } : tab,
        ),
      }))
    },

    updateTabExecution: (
      tabId: string,
      result: any,
      error: any,
      isExecuting: boolean,
      lastExecutedQuery: string,
    ) => {
      set((prev) => ({
        tabs: prev.tabs.map((tab) =>
          tab.id === tabId
            ? { ...tab, result, error, isExecuting, lastExecutedQuery }
            : tab,
        ),
      }))
    },

    createNewQueryTab: () => {
      const newTab: SqlTab = {
        id: `query-${Date.now()}`,
        title: 'New Query',
        query: '',
        isModified: false,
      }
      get().addTab(newTab)
    },

    // Query history actions
    setQueryHistory: (history: QueryHistoryItem[]) => {
      set({ queryHistory: history })
      saveQueryHistory(history)
    },

    addToHistory: (query: string, success: boolean) => {
      set((prev) => {
        const newHistory = [
          {
            id: `history-${Date.now()}`,
            query,
            timestamp: Date.now(),
            success,
          },
          ...prev.queryHistory.slice(0, 99), // Keep last 100 items
        ]
        saveQueryHistory(newHistory)
        return { queryHistory: newHistory }
      })
    },

    clearHistory: () => {
      set({ queryHistory: [] })
      saveQueryHistory([])
    },

    selectFromHistory: (query: string) => {
      set({ selectedQuery: query })
    },

    // UI actions
    setShowSidebar: (show: boolean) => {
      set({ showSidebar: show })
    },

    setSelectedQuery: (query: string) => {
      set({ selectedQuery: query })
    },
  })),
)
