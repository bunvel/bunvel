import { useSelector } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import type { SqlTab } from '@/types/tabs'

export interface SqlTabsState {
  tabs: Array<SqlTab>
  activeTabId: string | null
}

export interface SqlTabsActions {
  setTabs: (tabs: Array<SqlTab>) => void
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
}

const DEFAULT_TAB_LIMIT = 10

const sqlTabsStore = new Store<SqlTabsState>({
  tabs: [],
  activeTabId: null,
})

export const sqlTabsActions: SqlTabsActions = {
  setTabs: (tabs: Array<SqlTab>) => {
    sqlTabsStore.setState((prev) => ({ ...prev, tabs }))
  },

  setActiveTabId: (tabId: string | null) => {
    sqlTabsStore.setState((prev) => ({ ...prev, activeTabId: tabId }))
  },

  addTab: (tab: SqlTab, maxTabs = DEFAULT_TAB_LIMIT) => {
    sqlTabsStore.setState((prev) => {
      const existingTab = prev.tabs.find((t) => t.query === tab.query)
      if (existingTab) {
        return { ...prev, activeTabId: existingTab.id }
      }

      const newTabs = [...prev.tabs, tab]
      const finalTabs =
        newTabs.length > maxTabs ? newTabs.slice(-maxTabs) : newTabs

      return {
        ...prev,
        tabs: finalTabs,
        activeTabId: tab.id,
      }
    })
  },

  removeTab: (tabId: string) => {
    sqlTabsStore.setState((prev) => {
      const newTabs = prev.tabs.filter((t) => t.id !== tabId)
      let newActiveTabId = prev.activeTabId

      if (prev.activeTabId === tabId && newTabs.length > 0) {
        const currentIndex = prev.tabs.findIndex((t) => t.id === tabId)
        const nextIndex = Math.min(currentIndex, newTabs.length - 1)
        newActiveTabId = newTabs[nextIndex].id
      } else if (newTabs.length === 0) {
        newActiveTabId = null
      }

      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      }
    })
  },

  updateTabQuery: (tabId: string, query: string) => {
    sqlTabsStore.setState((prev) => ({
      ...prev,
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
    sqlTabsStore.setState((prev) => ({
      ...prev,
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

    sqlTabsActions.addTab(newTab)
  },
}

export function useSqlTabsStore<T>(selector: (state: SqlTabsState) => T): T {
  return useSelector(sqlTabsStore, selector)
}
