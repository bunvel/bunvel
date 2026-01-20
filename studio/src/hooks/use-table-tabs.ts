import { useTableTabsContext } from '@/contexts/table-tabs-context'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'

interface SearchParams {
  schema?: string
  table?: string
}

interface UseTableTabsOptions {
  maxTabs?: number
}

interface UseTableTabsReturn {
  selectedTables: string[]
  activeTable: string | undefined
  handleTabChange: (value: string) => void
  handleTabClose: (e: React.MouseEvent, tableKey: string) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
  addTable: (schema: string, table: string) => void
}

export function useTableTabs(options: UseTableTabsOptions = {}): UseTableTabsReturn {
  const { maxTabs = 5 } = options
  const navigate = useNavigate()
  const { schema, table } = useSearch({ strict: false }) as SearchParams
  const { 
    selectedTables, 
    addTable: contextAddTable, 
    removeTable: contextRemoveTable, 
  } = useTableTabsContext()

  const activeTable = schema && table ? `${schema}.${table}` : undefined

  const handleTabChange = useCallback((value: string) => {
    const [newSchema, newTable] = value.split('.')
    navigate({ search: { schema: newSchema, table: newTable } as any })
  }, [navigate])

  const removeTable = useCallback((tableKey: string) => {
    contextRemoveTable(tableKey)

    if (tableKey === activeTable) {
      const remainingTables = selectedTables.filter((t) => t !== tableKey)
      const [newSchema, newTable] = remainingTables[0]?.split('.') || []
      navigate(
        newTable
          ? { search: { schema: newSchema, table: newTable } as any }
          : { search: {} as any },
      )
    }
  }, [contextRemoveTable, selectedTables, activeTable, navigate])

  const removeTableBySchema = useCallback((schema: string, table: string) => {
    const tableKey = `${schema}.${table}`
    removeTable(tableKey)
  }, [removeTable])

  const handleTabClose = useCallback((e: React.MouseEvent, tableKey: string) => {
    e.stopPropagation()
    removeTable(tableKey)
  }, [removeTable])

  const addTable = useCallback((newSchema: string, newTable: string) => {
    contextAddTable(newSchema, newTable, maxTabs)
  }, [contextAddTable, maxTabs])

  // Update selected tables when URL changes
  useEffect(() => {
    if (schema && table) {
      addTable(schema, table)
    }
  }, [schema, table, addTable])

  return {
    selectedTables,
    activeTable,
    handleTabChange,
    handleTabClose,
    removeTable,
    removeTableBySchema,
    addTable,
  }
}
