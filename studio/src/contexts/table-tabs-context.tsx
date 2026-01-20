import { useTableStore } from '@/stores/table-store'
import type { TableTabsContextType } from '@/types'
import { createContext, ReactNode, useContext } from 'react'

const TableTabsContext = createContext<TableTabsContextType | undefined>(
  undefined,
)

interface TableTabsProviderProps {
  children: ReactNode
}

export function TableTabsProvider({ children }: TableTabsProviderProps) {
  // Use Zustand store instead of local state
  const tabs = useTableStore((state) => state.tabs)
  const addTable = useTableStore((state) => state.addTable)
  const removeTable = useTableStore((state) => state.removeTable)
  const removeTableBySchema = useTableStore(
    (state) => state.removeTableBySchema,
  )
  const setActiveTable = useTableStore((state) => state.setActiveTable)
  const setMaxTabs = useTableStore((state) => state.setMaxTabs)
  const clearAllTabs = useTableStore((state) => state.clearAllTabs)

  const value: TableTabsContextType = {
    selectedTables: tabs.selectedTables,
    activeTableKey: tabs.activeTableKey,
    maxTabs: tabs.maxTabs,
    addTable,
    removeTable,
    removeTableBySchema,
    setActiveTable,
    setMaxTabs,
    clearAllTabs,
  }

  return (
    <TableTabsContext.Provider value={value}>
      {children}
    </TableTabsContext.Provider>
  )
}

export function useTableTabsContext() {
  const context = useContext(TableTabsContext)
  if (context === undefined) {
    throw new Error(
      'useTableTabsContext must be used within a TableTabsProvider',
    )
  }
  return context
}
