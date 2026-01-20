export interface QueryHistoryItem {
  id: string
  query: string
  timestamp: number
  success: boolean
}

export interface UseQueryHistoryReturn {
  history: QueryHistoryItem[]
  addToHistory: (query: string, success: boolean) => void
  clearHistory: () => void
  selectFromHistory: (query: string) => void
}
