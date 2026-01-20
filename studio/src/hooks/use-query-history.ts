import type { QueryHistoryItem, UseQueryHistoryReturn } from '@/types'
import { useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'

export function useQueryHistory(
  onSelect?: (query: string) => void
): UseQueryHistoryReturn {
  const [history, setHistory] = useLocalStorage<QueryHistoryItem[]>(
    'sql-query-history',
    []
  )

  const addToHistory = useCallback((query: string, success: boolean) => {
    setHistory((prev) =>
      [
        {
          id: Date.now().toString(),
          query,
          timestamp: Date.now(),
          success,
        },
        ...prev,
      ].slice(0, 50),
    )
  }, [setHistory])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  const selectFromHistory = useCallback((query: string) => {
    onSelect?.(query)
  }, [onSelect])

  return {
    history,
    addToHistory,
    clearHistory,
    selectFromHistory,
  }
}
