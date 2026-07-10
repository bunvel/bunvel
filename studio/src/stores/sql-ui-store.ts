import { useSelector } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import type { QueryHistoryItem } from '@/types/history'
import { logger } from '@/lib/logger'

const QUERY_HISTORY_KEY = 'bunvel-query-history'

const loadQueryHistory = (): Array<QueryHistoryItem> => {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(QUERY_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    logger.error({
      msg: 'Failed to load query history from localStorage',
      error,
    })
    return []
  }
}

const saveQueryHistory = (history: Array<QueryHistoryItem>) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    logger.error({
      msg: 'Failed to save query history to localStorage',
      error,
    })
  }
}

export interface SqlUiState {
  queryHistory: Array<QueryHistoryItem>
  showSidebar: boolean
  selectedQuery: string
}

export interface SqlUiActions {
  setQueryHistory: (history: Array<QueryHistoryItem>) => void
  addToHistory: (query: string, success: boolean) => void
  clearHistory: () => void
  selectFromHistory: (query: string) => void
  setShowSidebar: (show: boolean) => void
  setSelectedQuery: (query: string) => void
}

const sqlUiStore = new Store<SqlUiState>({
  queryHistory: loadQueryHistory(),
  showSidebar: true,
  selectedQuery: '',
})

export const sqlUiActions: SqlUiActions = {
  setQueryHistory: (history: Array<QueryHistoryItem>) => {
    sqlUiStore.setState((prev) => ({ ...prev, queryHistory: history }))
    saveQueryHistory(history)
  },

  addToHistory: (query: string, success: boolean) => {
    sqlUiStore.setState((prev) => {
      const newHistory = [
        {
          id: `history-${Date.now()}`,
          query,
          timestamp: Date.now(),
          success,
        },
        ...prev.queryHistory.slice(0, 99),
      ]
      saveQueryHistory(newHistory)
      return { ...prev, queryHistory: newHistory }
    })
  },

  clearHistory: () => {
    sqlUiStore.setState((prev) => ({ ...prev, queryHistory: [] }))
    saveQueryHistory([])
  },

  selectFromHistory: (query: string) => {
    sqlUiStore.setState((prev) => ({ ...prev, selectedQuery: query }))
  },

  setShowSidebar: (show: boolean) => {
    sqlUiStore.setState((prev) => ({ ...prev, showSidebar: show }))
  },

  setSelectedQuery: (query: string) => {
    sqlUiStore.setState((prev) => ({ ...prev, selectedQuery: query }))
  },
}

export function useSqlUiStore<T>(selector: (state: SqlUiState) => T): T {
  return useSelector(sqlUiStore, selector)
}
