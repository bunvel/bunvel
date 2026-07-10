import { useTableData, useTableMetadata } from '@/hooks/queries/useTableData'
import { useTables } from '@/hooks/queries/useTables'
import { tableStateActions, useTableStateStore } from '@/stores/table-state-store'
import { tableTabsActions, useTableTabsStore } from '@/stores/table-tabs-store'
import type { TableKind } from '@/types/database'
import type {
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
  selectedTables: Array<string>
  activeTable: string | undefined
  handleTabChange: (value: string) => void
  handleTabClose: (e: React.MouseEvent, tableKey: string) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
  addTable: (schema: string, table: string) => void

  // Selection management
  selectedRows: Array<TableRow>
  rowSelection: Record<string, boolean>
  handleRowSelectionChange: (newSelectedRows: Array<TableRow>) => void
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
  sorts: Array<SortConfig>
  handleSortChange: (newSorts: Array<SortConfig>) => void

  // Filtering management
  filters: Array<FilterConfig>
  handleFilterChange: (newFilters: Array<FilterConfig>) => void
}

export function useTableManager(): UseTableManagerReturn {
  const { schema, table } = useSearch({ strict: false }) as {
    schema?: string
    table?: string
  }
  const navigate = useNavigate()

  // TanStack Store hooks for tab management
  const tabs = useTableTabsStore((state) => state.tabs)
  const addTable = tableTabsActions.addTable
  const removeTable = tableTabsActions.removeTable
  const removeTableBySchema = tableTabsActions.removeTableBySchema
  const setActiveTable = tableTabsActions.setActiveTable

  // TanStack Store hooks for table state
  const setTableState = tableStateActions.setTableState
  const setSelectedRows = tableStateActions.setSelectedRows
  const setRowSelection = tableStateActions.setRowSelection
  const setPagination = tableStateActions.setPagination
  const setSorts = tableStateActions.setSorts
  const setFilters = tableStateActions.setFilters
  const cleanupTableState = tableStateActions.cleanupTableState

  // Derive schema/table from URL or active tab fallback
  const activeTableKey = tabs.activeTableKey
  const resolvedSchema = schema || activeTableKey?.split('.')?.[0]
  const resolvedTable = table || activeTableKey?.split('.')?.[1]
  const currentTableKey = resolvedSchema && resolvedTable ? `${resolvedSchema}.${resolvedTable}` : null

  // Get current table state with proper subscription
  const tableState = useTableStateStore((state) =>
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
      setActiveTable(`${schema}.${table}`)
    }
  }, [schema, table, addTable, setActiveTable])

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

  // Tab management functions - direct TanStack Store implementation
  const handleTabChange = (value: string) => {
    const [newSchema, newTable] = value.split('.')
    setActiveTable(value)
    navigate({ search: { schema: newSchema, table: newTable } as any })
  }

  const handleTabClose = (e: React.MouseEvent, tableKey: string) => {
    e.stopPropagation()
    removeTable(tableKey)
    cleanupTableState(tableKey)

    // If removing active table, navigate to next available table or clear search params if last tab is closed
    const currentActiveKey =
      schema && table ? `${schema}.${table}` : tabs.activeTableKey
    if (currentActiveKey === tableKey) {
      const remainingTables = tabs.selectedTables.filter(
        (t: string) => t !== tableKey,
      )
      if (remainingTables.length > 0) {
        const nextActive = remainingTables[0]
        const [newSchema, newTable] = nextActive.split('.')
        setActiveTable(nextActive)
        navigate({ search: { schema: newSchema, table: newTable } as any })
      } else {
        setActiveTable(null)
        navigate({ search: {} as any })
      }
    }
  }

  const handleAddTable = (newSchema: string, newTable: string) => {
    addTable(newSchema, newTable, MAX_TABLE_TABS)
  }

  // Selection management
  const handleRowSelectionChange = (newSelectedRows: Array<TableRow>) => {
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
  const handleSortChange = (newSorts: Array<SortConfig>) => {
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
  const handleFilterChange = (newFilters: Array<FilterConfig>) => {
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

  // Tab state from TanStack Store
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
