import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

interface TableTabsContextType {
  selectedTables: string[]
  addTable: (schema: string, table: string, maxTabs?: number) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
}

const TableTabsContext = createContext<TableTabsContextType | undefined>(
  undefined,
)

interface TableTabsProviderProps {
  children: ReactNode
}

export function TableTabsProvider({ children }: TableTabsProviderProps) {
  const [selectedTables, setSelectedTables] = useState<string[]>([])

  const addTable = useCallback((schema: string, table: string, maxTabs = 5) => {
    const tableKey = `${schema}.${table}`
    setSelectedTables((prev) =>
      prev.includes(tableKey)
        ? prev
        : prev.length >= maxTabs
          ? [...prev.slice(0, maxTabs - 1), tableKey]
          : [...prev, tableKey],
    )
  }, [])

  const removeTable = useCallback((tableKey: string) => {
    setSelectedTables((prev) => prev.filter((t) => t !== tableKey))
  }, [])

  const removeTableBySchema = useCallback(
    (schema: string, table: string) => {
      const tableKey = `${schema}.${table}`
      removeTable(tableKey)
    },
    [removeTable],
  )

  const value: TableTabsContextType = {
    selectedTables,
    addTable,
    removeTable,
    removeTableBySchema,
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
