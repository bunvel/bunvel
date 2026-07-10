import { useSelector } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import type {
  FilterConfig,
  PaginationConfig,
  SortConfig,
  TableRow,
  TableState,
} from '@/types/table'
import { DEFAULT_PAGE_SIZE } from '@/constants/app'

export interface TableStateStoreState {
  tableStates: Record<string, TableState>
}

export interface TableStateActions {
  setTableState: (tableKey: string, state: Partial<TableState>) => void
  getTableState: (tableKey: string) => TableState
  resetTableState: (tableKey: string) => void
  clearAllTableStates: () => void
  setSelectedRows: (tableKey: string, selectedRows: Array<TableRow>) => void
  setRowSelection: (
    tableKey: string,
    rowSelection: Record<string, boolean>,
  ) => void
  setPagination: (tableKey: string, pagination: PaginationConfig) => void
  setSorts: (tableKey: string, sorts: Array<SortConfig>) => void
  setFilters: (tableKey: string, filters: Array<FilterConfig>) => void
  cleanupTableState: (tableKey: string) => void
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

const tableStateStore = new Store<TableStateStoreState>({
  tableStates: {},
})

export const tableStateActions: TableStateActions = {
  setTableState: (tableKey: string, state: Partial<TableState>) => {
    tableStateStore.setState((prev) => ({
      ...prev,
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
    const { tableStates } = tableStateStore.get()
    return tableStates[tableKey] || DEFAULT_TABLE_STATE
  },

  resetTableState: (tableKey: string) => {
    tableStateStore.setState((prev) => ({
      ...prev,
      tableStates: {
        ...prev.tableStates,
        [tableKey]: DEFAULT_TABLE_STATE,
      },
    }))
  },

  clearAllTableStates: () => {
    tableStateStore.setState(() => ({ tableStates: {} }))
  },

  setSelectedRows: (tableKey: string, selectedRows: Array<TableRow>) => {
    tableStateActions.setTableState(tableKey, { selectedRows })
  },

  setRowSelection: (
    tableKey: string,
    rowSelection: Record<string, boolean>,
  ) => {
    tableStateActions.setTableState(tableKey, { rowSelection })
  },

  setPagination: (tableKey: string, pagination: PaginationConfig) => {
    tableStateActions.setTableState(tableKey, { pagination })
  },

  setSorts: (tableKey: string, sorts: Array<SortConfig>) => {
    tableStateActions.setTableState(tableKey, { sorts })
  },

  setFilters: (tableKey: string, filters: Array<FilterConfig>) => {
    tableStateActions.setTableState(tableKey, { filters })
  },

  cleanupTableState: (tableKey: string) => {
    tableStateStore.setState((prev) => {
      const newTableStates = { ...prev.tableStates }
      delete newTableStates[tableKey]
      return { ...prev, tableStates: newTableStates }
    })
  },
}

export function useTableStateStore<T>(selector: (state: TableStateStoreState) => T): T {
  return useSelector(tableStateStore, selector)
}
