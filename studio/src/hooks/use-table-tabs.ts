import { useTableTabsContext } from '@/contexts/table-tabs-context'
import { SchemaTable } from '@/types'
import { MAX_TABLE_TABS } from '@/utils/constant'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'

interface UseTableTabsReturn {
  selectedTables: string[]
  activeTable: string | undefined
  handleTabChange: (value: string) => void
  handleTabClose: (e: React.MouseEvent, tableKey: string) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
  addTable: (schema: string, table: string) => void
}

export function useTableTabs(): UseTableTabsReturn {
  const navigate = useNavigate()
  const { schema, table } = useSearch({ strict: false }) as SchemaTable
  const {
    selectedTables,
    addTable: contextAddTable,
    removeTable: contextRemoveTable,
    activeTableKey,
    setActiveTable,
  } = useTableTabsContext()

  const activeTable =
    schema && table ? `${schema}.${table}` : activeTableKey || undefined

  const handleTabChange = useCallback(
    (value: string) => {
      const [newSchema, newTable] = value.split('.')
      setActiveTable(value)
      navigate({ search: { schema: newSchema, table: newTable } as any })
    },
    [navigate, setActiveTable],
  )

  const removeTable = useCallback(
    (tableKey: string) => {
      contextRemoveTable(tableKey)

      if (tableKey === activeTable) {
        const remainingTables = selectedTables.filter((t) => t !== tableKey)
        const [newSchema, newTable] = remainingTables[0]?.split('.') || []
        const newActiveTable = remainingTables[0] || null
        setActiveTable(newActiveTable)
        navigate(
          newTable
            ? { search: { schema: newSchema, table: newTable } as any }
            : { search: {} as any },
        )
      }
    },
    [contextRemoveTable, selectedTables, activeTable, navigate, setActiveTable],
  )

  const removeTableBySchema = useCallback(
    (schema: string, table: string) => {
      const tableKey = `${schema}.${table}`
      removeTable(tableKey)
    },
    [removeTable],
  )

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tableKey: string) => {
      e.stopPropagation()
      removeTable(tableKey)
    },
    [removeTable],
  )

  const addTable = useCallback(
    (newSchema: string, newTable: string) => {
      contextAddTable(newSchema, newTable, MAX_TABLE_TABS)
    },
    [contextAddTable],
  )

  // Update selected tables when URL changes
  useEffect(() => {
    if (schema && table) {
      addTable(schema, table)
    }
  }, [schema, table, addTable])

  // Restore active table from store to URL when component mounts and URL has no table
  useEffect(() => {
    if (
      !schema &&
      !table &&
      activeTableKey &&
      selectedTables.includes(activeTableKey)
    ) {
      const [restoreSchema, restoreTable] = activeTableKey.split('.')
      navigate({
        search: { schema: restoreSchema, table: restoreTable } as any,
      })
    }
  }, [schema, table, activeTableKey, selectedTables, navigate])

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
