import type {
  FilterConfig,
  PaginationConfig,
  SortConfig,
  TableRow,
  TableState,
  TableTabsState,
} from '@/types/table'
import { DEFAULT_PAGE_SIZE } from '@/constants/app'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface TableStore {
  // Table states per table
  tableStates: Record<string, TableState>

  // Tab management
  tabs: TableTabsState

  // Table state actions
  setTableState: (tableKey: string, state: Partial<TableState>) => void
  getTableState: (tableKey: string) => TableState
  resetTableState: (tableKey: string) => void
  clearAllTableStates: () => void

  // Specific table state setters
  setSelectedRows: (tableKey: string, selectedRows: Array<TableRow>) => void
  setRowSelection: (
    tableKey: string,
    rowSelection: Record<string, boolean>,
  ) => void
  setPagination: (tableKey: string, pagination: PaginationConfig) => void
  setSorts: (tableKey: string, sorts: Array<SortConfig>) => void
  setFilters: (tableKey: string, filters: Array<FilterConfig>) => void

  // Tab management actions
  addTable: (schema: string, table: string, maxTabs?: number) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
  setActiveTable: (tableKey: string | null) => void
  setMaxTabs: (maxTabs: number) => void
  clearAllTabs: () => void

  // Utility actions
  cleanupTableState: (tableKey: string) => void // Remove table from both tabs and state
}

const DEFAULT_TABLE_STATE: TableState = {
  selectedRows: [],
  rowSelection: {},
  pagination: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  sorts: [],
  filters: [],
}

const DEFAULT_TABS_STATE: TableTabsState = {
  selectedTables: [],
  maxTabs: 5,
  activeTableKey: null,
}

export const useTableStore = create<TableStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    tableStates: {},
    tabs: DEFAULT_TABS_STATE,

    // Table state actions
    setTableState: (tableKey: string, state: Partial<TableState>) => {
      set((prev) => ({
        tableStates: {
          ...prev.tableStates,
          [tableKey]: {
            ...DEFAULT_TABLE_STATE,
            ...prev.tableStates[tableKey],
            ...state,
          },
        },
      }))
    },

    getTableState: (tableKey: string) => {
      const { tableStates } = get()
      return tableStates[tableKey] || DEFAULT_TABLE_STATE
    },

    resetTableState: (tableKey: string) => {
      set((prev) => ({
        tableStates: {
          ...prev.tableStates,
          [tableKey]: DEFAULT_TABLE_STATE,
        },
      }))
    },

    clearAllTableStates: () => {
      set({ tableStates: {} })
    },

    // Specific table state setters
    setSelectedRows: (tableKey: string, selectedRows: Array<TableRow>) => {
      get().setTableState(tableKey, { selectedRows })
    },

    setRowSelection: (
      tableKey: string,
      rowSelection: Record<string, boolean>,
    ) => {
      get().setTableState(tableKey, { rowSelection })
    },

    setPagination: (tableKey: string, pagination: PaginationConfig) => {
      get().setTableState(tableKey, { pagination })
    },

    setSorts: (tableKey: string, sorts: Array<SortConfig>) => {
      get().setTableState(tableKey, { sorts })
    },

    setFilters: (tableKey: string, filters: Array<FilterConfig>) => {
      get().setTableState(tableKey, { filters })
    },

    // Tab management actions
    addTable: (schema: string, table: string, maxTabs?: number) => {
      const tableKey = `${schema}.${table}`
      const { tabs } = get()
      const actualMaxTabs = maxTabs ?? tabs.maxTabs

      set((prev) => ({
        tabs: {
          ...prev.tabs,
          selectedTables: prev.tabs.selectedTables.includes(tableKey)
            ? prev.tabs.selectedTables
            : prev.tabs.selectedTables.length >= actualMaxTabs
              ? [
                  ...prev.tabs.selectedTables.slice(0, actualMaxTabs - 1),
                  tableKey,
                ]
              : [...prev.tabs.selectedTables, tableKey],
        },
      }))
    },

    removeTable: (tableKey: string) => {
      set((prev) => {
        const newTableStates = { ...prev.tableStates }
        delete newTableStates[tableKey]

        return {
          tabs: {
            ...prev.tabs,
            selectedTables: prev.tabs.selectedTables.filter(
              (t: string) => t !== tableKey,
            ),
            activeTableKey:
              prev.tabs.activeTableKey === tableKey
                ? null
                : prev.tabs.activeTableKey,
          },
          tableStates: newTableStates,
        }
      })
    },

    removeTableBySchema: (schema: string, table: string) => {
      const tableKey = `${schema}.${table}`
      get().removeTable(tableKey)
    },

    setActiveTable: (tableKey: string | null) => {
      set((prev) => ({
        tabs: {
          ...prev.tabs,
          activeTableKey: tableKey,
        },
      }))
    },

    setMaxTabs: (maxTabs: number) => {
      set((prev) => ({
        tabs: {
          ...prev.tabs,
          maxTabs,
        },
      }))
    },

    clearAllTabs: () => {
      set(() => ({
        tabs: DEFAULT_TABS_STATE,
      }))
    },

    // Utility actions
    cleanupTableState: (tableKey: string) => {
      get().removeTable(tableKey)
    },
  })),
)
