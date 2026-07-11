import type { QueryHistoryItem } from '@/types/history'
import { createStore } from './create-store'
import { createPersistence } from './persistence'

const queryHistoryPersistence = createPersistence<Array<QueryHistoryItem>>({
  key: 'bunvel-query-history',
})

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

const { store: sqlUiStore, actions: sqlUiActions, useStore: useSqlUiStore } =
  createStore<SqlUiState, SqlUiActions>({
    name: 'sql-ui',
    initialState: {
      queryHistory: queryHistoryPersistence.load() || [],
      showSidebar: true,
      selectedQuery: '',
    },
    actions: (setState) => ({
      setQueryHistory: (history) => {
        setState((prev) => ({ ...prev, queryHistory: history }))
        queryHistoryPersistence.save(history)
      },

      addToHistory: (query, success) => {
        setState((prev) => {
          const newHistory = [
            {
              id: `history-${Date.now()}`,
              query,
              timestamp: Date.now(),
              success,
            },
            ...prev.queryHistory.slice(0, 99),
          ]
          queryHistoryPersistence.save(newHistory)
          return { ...prev, queryHistory: newHistory }
        })
      },

      clearHistory: () => {
        setState((prev) => ({ ...prev, queryHistory: [] }))
        queryHistoryPersistence.save([])
      },

      selectFromHistory: (query) => {
        setState((prev) => ({ ...prev, selectedQuery: query }))
      },

      setShowSidebar: (show) => {
        setState((prev) => ({ ...prev, showSidebar: show }))
      },

      setSelectedQuery: (query) => {
        setState((prev) => ({ ...prev, selectedQuery: query }))
      },
    }),
  })

export { sqlUiActions, sqlUiStore, useSqlUiStore }

