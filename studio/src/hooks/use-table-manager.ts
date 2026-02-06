import { useTableData, useTableMetadata } from '@/hooks/queries/useTableData'
import { useTables } from '@/hooks/queries/useTables'
import { useTableStore } from '@/stores/table-store'
import { TableKind } from '@/types/database'
import { SchemaTable } from '@/types/schema'
import {
  FilterConfig,
  PaginationConfig,
  SortConfig,
  TableRow,
} from '@/types/table'
import { DEFAULT_PAGE_SIZE, MAX_TABLE_TABS } from '@/constants/app'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'

export interface UseTableManagerReturn {
  // Current table info
  currentTableKey: string | null
  schema: string | undefined
  table: string | undefined
  kind: TableKind | undefined

  // Data and loading states
  metadata: any
  tableData: any
  isLoading: boolean
  error: any

  // Table state
  tableState: any

  // Tab management
  selectedTables: string[]
  activeTable: string | undefined
  handleTabChange: (value: string) => void
  handleTabClose: (e: React.MouseEvent, tableKey: string) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
  addTable: (schema: string, table: string) => void

  // Selection management
  selectedRows: TableRow[]
  rowSelection: Record<string, boolean>
  handleRowSelectionChange: (newSelectedRows: TableRow[]) => void
  handleRowSelectionStateChange: (
    updaterOrValue:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => void
  handleSelectionClear: () => void

  // Pagination management
  pagination: PaginationConfig
  handlePaginationChange: (newPagination: PaginationConfig) => void

  // Sorting management
  sorts: SortConfig[]
  handleSortChange: (newSorts: SortConfig[]) => void

  // Filtering management
  filters: FilterConfig[]
  handleFilterChange: (newFilters: FilterConfig[]) => void
}

export function useTableManager(): UseTableManagerReturn {
  const { schema, table } = useSearch({ strict: false }) as SchemaTable
  const navigate = useNavigate()

  // Zustand store hooks for tab management
  const tabs = useTableStore((state) => state.tabs)
  const addTable = useTableStore((state) => state.addTable)
  const removeTable = useTableStore((state) => state.removeTable)
  const removeTableBySchema = useTableStore(
    (state) => state.removeTableBySchema,
  )
  const setActiveTable = useTableStore((state) => state.setActiveTable)

  // Zustand store hooks for table state
  const setTableState = useTableStore((state) => state.setTableState)
  const setSelectedRows = useTableStore((state) => state.setSelectedRows)
  const setRowSelection = useTableStore((state) => state.setRowSelection)
  const setPagination = useTableStore((state) => state.setPagination)
  const setSorts = useTableStore((state) => state.setSorts)
  const setFilters = useTableStore((state) => state.setFilters)

  // Get current table key
  const currentTableKey = schema && table ? `${schema}.${table}` : null

  // Get current table state with proper subscription
  const tableState = useTableStore((state) =>
    currentTableKey ? state.tableStates[currentTableKey] : null,
  )

  // Initialize table state for new tables
  useEffect(() => {
    if (currentTableKey) {
      // This will create the table state if it doesn't exist
      setTableState(currentTableKey, {})
    }
  }, [currentTableKey, setTableState])

  // Update selected tables when URL changes
  useEffect(() => {
    if (schema && table) {
      addTable(schema, table, MAX_TABLE_TABS)
    }
  }, [schema, table, addTable])

  // Restore active table from store to URL when component mounts and URL has no table
  useEffect(() => {
    if (
      !schema &&
      !table &&
      tabs.activeTableKey &&
      tabs.selectedTables.includes(tabs.activeTableKey)
    ) {
      const [restoreSchema, restoreTable] = tabs.activeTableKey.split('.')
      navigate({
        search: { schema: restoreSchema, table: restoreTable } as any,
      })
    }
  }, [schema, table, tabs.activeTableKey, tabs.selectedTables, navigate])

  // Tab management functions - direct Zustand implementation
  const handleTabChange = (value: string) => {
    const [newSchema, newTable] = value.split('.')
    setActiveTable(value)
    navigate({ search: { schema: newSchema, table: newTable } as any })
  }

  const handleTabClose = (e: React.MouseEvent, tableKey: string) => {
    e.stopPropagation()
    removeTable(tableKey)

    // If removing active table, navigate to next available table
    if (tabs.activeTableKey === tableKey && tabs.selectedTables.length > 1) {
      const remainingTables = tabs.selectedTables.filter(
        (t: string) => t !== tableKey,
      )
      const [newSchema, newTable] = remainingTables[0]?.split('.') || []
      const newActiveTable = remainingTables[0] || null
      setActiveTable(newActiveTable)
      navigate(
        newTable
          ? { search: { schema: newSchema, table: newTable } as any }
          : { search: {} as any },
      )
    }
  }

  const handleAddTable = (newSchema: string, newTable: string) => {
    addTable(newSchema, newTable, MAX_TABLE_TABS)
  }

  // Selection management
  const handleRowSelectionChange = (newSelectedRows: TableRow[]) => {
    if (currentTableKey) {
      setSelectedRows(currentTableKey, newSelectedRows)
    }
  }

  const handleRowSelectionStateChange = (
    updaterOrValue:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => {
    if (currentTableKey) {
      const currentRowSelection = tableState?.rowSelection || {}
      const newRowSelection =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(currentRowSelection)
          : updaterOrValue
      setRowSelection(currentTableKey, newRowSelection)
    }
  }

  const handleSelectionClear = () => {
    if (currentTableKey) {
      setSelectedRows(currentTableKey, [])
      setRowSelection(currentTableKey, {})
    }
  }

  // Sorting management
  const handleSortChange = (newSorts: SortConfig[]) => {
    if (currentTableKey) {
      setSorts(currentTableKey, newSorts)
      // Reset to first page when sort changes
      const currentPagination = tableState?.pagination || {
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
      }
      setPagination(currentTableKey, {
        ...currentPagination,
        pageIndex: 0,
      })
    }
  }

  // Filtering management
  const handleFilterChange = (newFilters: FilterConfig[]) => {
    if (currentTableKey) {
      setFilters(currentTableKey, newFilters)
      // Reset to first page when filters change
      const currentPagination = tableState?.pagination || {
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
      }
      setPagination(currentTableKey, {
        ...currentPagination,
        pageIndex: 0,
      })
    }
  }

  // Pagination management
  const handlePaginationChange = (newPagination: PaginationConfig) => {
    if (currentTableKey) {
      setPagination(currentTableKey, newPagination)
    }
  }

  // Get table metadata for columns
  const { data: metadata, isLoading: isMetadataLoading } = useTableMetadata(
    schema,
    table,
  )

  // Get table data with pagination, sorting, and filtering
  const {
    data: tableData,
    isLoading: isTableDataLoading,
    error,
  } = useTableData(schema, table, {
    page: (tableState?.pagination.pageIndex ?? 0) + 1, // +1 because backend is 1-indexed
    pageSize: tableState?.pagination.pageSize ?? DEFAULT_PAGE_SIZE,
    primaryKeys: metadata?.primary_keys || [],
    sorts: tableState?.sorts,
    filters:
      tableState?.filters && tableState.filters.length > 0
        ? tableState.filters
        : undefined,
  })

  const { data: tables } = useTables()

  const kind: TableKind | undefined = tables?.find(
    (t) => t.name === table,
  )?.kind

  const isLoading = isMetadataLoading || isTableDataLoading

  // Computed values
  const selectedRows = tableState?.selectedRows || []
  const rowSelection = tableState?.rowSelection || {}
  const pagination = tableState?.pagination || {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  }
  const sorts = tableState?.sorts || []
  const filters = tableState?.filters || []

  // Tab state from Zustand store
  const selectedTables = tabs.selectedTables
  const activeTable =
    schema && table ? `${schema}.${table}` : tabs.activeTableKey || undefined

  return {
    // Current table info
    currentTableKey,
    schema,
    table,
    kind,

    // Data and loading states
    metadata,
    tableData,
    isLoading,
    error,

    // Table state
    tableState,

    // Tab management
    selectedTables,
    activeTable,
    handleTabChange,
    handleTabClose,
    removeTable,
    removeTableBySchema,
    addTable: handleAddTable,

    // Selection management
    selectedRows,
    rowSelection,
    handleRowSelectionChange,
    handleRowSelectionStateChange,
    handleSelectionClear,

    // Pagination management
    pagination,
    handlePaginationChange,

    // Sorting management
    sorts,
    handleSortChange,

    // Filtering management
    filters,
    handleFilterChange,
  }
}
