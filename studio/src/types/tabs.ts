export interface SqlTab {
  id: string
  title: string
  query: string
  isModified?: boolean
  result?: any
  error?: any
  isExecuting?: boolean
  lastExecutedQuery?: string
}

export interface TableTabsContextType {
  selectedTables: string[]
  activeTableKey: string | null
  maxTabs: number
  addTable: (schema: string, table: string, maxTabs?: number) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
  setActiveTable: (tableKey: string | null) => void
  setMaxTabs: (maxTabs: number) => void
  clearAllTabs: () => void
}

export interface SqlTabsContextType {
  tabs: SqlTab[]
  activeTabId: string | undefined
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
}
