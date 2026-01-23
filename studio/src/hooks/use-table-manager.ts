import { useTableData, useTableMetadata } from '@/hooks/queries/useTableData'
import { useTables } from '@/hooks/queries/useTables'
import { useTableTabs } from '@/hooks/use-table-tabs'
import { useTableStore } from '@/stores/table-store'
import { SchemaTable, TableKind } from '@/types'
import {
  FilterConfig,
  PaginationConfig,
  SortConfig,
  TableRow,
} from '@/types/table'
import { DEFAULT_PAGE_SIZE } from '@/utils/constant'
import { useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'

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

  // Use existing tab management
  const tabManager = useTableTabs()

  // Zustand store hooks
  const setTableState = useTableStore((state) => state.setTableState)
  const setSelectedRows = useTableStore((state) => state.setSelectedRows)
  const setRowSelection = useTableStore((state) => state.setRowSelection)
  const setPagination = useTableStore((state) => state.setPagination)
  const setSorts = useTableStore((state) => state.setSorts)
  const setFilters = useTableStore((state) => state.setFilters)

  // Get current table key
  const currentTableKey = useMemo(() => {
    return schema && table ? `${schema}.${table}` : null
  }, [schema, table])

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

  // Tab management functions - using existing tab manager
  const handleTabChange = tabManager.handleTabChange
  const handleTabClose = tabManager.handleTabClose
  const removeTable = tabManager.removeTable
  const removeTableBySchema = tabManager.removeTableBySchema
  const addTable = tabManager.addTable

  // Selection management
  const handleRowSelectionChange = useCallback(
    (newSelectedRows: TableRow[]) => {
      if (currentTableKey) {
        setSelectedRows(currentTableKey, newSelectedRows)
      }
    },
    [currentTableKey, setSelectedRows],
  )

  const handleRowSelectionStateChange = useCallback(
    (
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
    },
    [currentTableKey, tableState?.rowSelection, setRowSelection],
  )

  const handleSelectionClear = useCallback(() => {
    if (currentTableKey) {
      setSelectedRows(currentTableKey, [])
      setRowSelection(currentTableKey, {})
    }
  }, [currentTableKey, setSelectedRows, setRowSelection])

  // Sorting management
  const handleSortChange = useCallback(
    (newSorts: SortConfig[]) => {
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
    },
    [currentTableKey, tableState?.pagination, setSorts, setPagination],
  )

  // Filtering management
  const handleFilterChange = useCallback(
    (newFilters: FilterConfig[]) => {
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
    },
    [currentTableKey, tableState?.pagination, setFilters, setPagination],
  )

  // Pagination management
  const handlePaginationChange = useCallback(
    (newPagination: PaginationConfig) => {
      if (currentTableKey) {
        setPagination(currentTableKey, newPagination)
      }
    },
    [currentTableKey, setPagination],
  )

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

  // Tab state from tab manager
  const selectedTables = tabManager.selectedTables
  const activeTable = tabManager.activeTable

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
    addTable,

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
