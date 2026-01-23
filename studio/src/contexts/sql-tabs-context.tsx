import type { SqlTab, SqlTabsContextType } from '@/types'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const SqlTabsContext = createContext<SqlTabsContextType | undefined>(undefined)

interface SqlTabsProviderProps {
  children: ReactNode
}

export function SqlTabsProvider({ children }: SqlTabsProviderProps) {
  const [tabs, setTabs] = useState<SqlTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  const addTab = useCallback((tab: SqlTab, maxTabs = 10) => {
    setTabs((prev) => {
      // Check if tab with same query already exists
      const existingTab = prev.find((t) => t.query === tab.query)
      if (existingTab) {
        // Switch to existing tab instead of creating duplicate
        setActiveTabId(existingTab.id)
        return prev
      }

      const newTabs = [...prev, tab]
      return newTabs.length > maxTabs ? newTabs.slice(-maxTabs) : newTabs
    })
    setActiveTabId(tab.id)
  }, [])

  const removeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== tabId)

        // If removing active tab, set new active tab
        if (activeTabId === tabId && newTabs.length > 0) {
          const currentIndex = prev.findIndex((t) => t.id === tabId)
          const nextIndex = Math.min(currentIndex, newTabs.length - 1)
          setActiveTabId(newTabs[nextIndex].id)
        } else if (newTabs.length === 0) {
          setActiveTabId(null)
        }

        return newTabs
      })
    },
    [activeTabId],
  )

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const updateTabQuery = useCallback((tabId: string, query: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, query, isModified: true } : tab,
      ),
    )
  }, [])

  const updateTabExecution = useCallback(
    (
      tabId: string,
      result: any,
      error: any,
      isExecuting: boolean,
      lastExecutedQuery: string,
    ) => {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === tabId
            ? { ...tab, result, error, isExecuting, lastExecutedQuery }
            : tab,
        ),
      )
    },
    [],
  )

  const createNewQueryTab = useCallback(() => {
    const newTab: SqlTab = {
      id: `query-${Date.now()}`,
      title: 'New Query',
      query: '',
      isModified: false,
    }
    addTab(newTab)
  }, [addTab])

  // Create default query tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      createNewQueryTab()
    }
  }, [tabs.length, createNewQueryTab])

  const value: SqlTabsContextType = {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    updateTabQuery,
    updateTabExecution,
    createNewQueryTab,
  }

  return (
    <SqlTabsContext.Provider value={value}>{children}</SqlTabsContext.Provider>
  )
}

export function useSqlTabsContext() {
  const context = useContext(SqlTabsContext)
  if (context === undefined) {
    throw new Error('useSqlTabsContext must be used within a SqlTabsProvider')
  }
  return context
}
