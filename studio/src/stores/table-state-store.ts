import { DEFAULT_PAGE_SIZE } from '@/constants/app'
import type {
    FilterConfig,
    PaginationConfig,
    SortConfig,
    TableRow,
    TableState,
} from '@/types/table'
import { createStore } from './create-store'

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

const { store: tableStateStore, actions: tableStateActions, useStore: useTableStateStore } =
  createStore<TableStateStoreState, TableStateActions>({
    name: 'table-state',
    initialState: {
      tableStates: {},
    },
    actions: (setState, getState) => ({
      setTableState: (tableKey, state) => {
        setState((prev) => ({
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

      getTableState: (tableKey) => {
        const { tableStates } = getState()
        return tableStates[tableKey] || DEFAULT_TABLE_STATE
      },

      resetTableState: (tableKey) => {
        setState((prev) => ({
          ...prev,
          tableStates: {
            ...prev.tableStates,
            [tableKey]: DEFAULT_TABLE_STATE,
          },
        }))
      },

      clearAllTableStates: () => {
        setState(() => ({ tableStates: {} }))
      },

      setSelectedRows: (tableKey, selectedRows) => {
        tableStateActions.setTableState(tableKey, { selectedRows })
      },

      setRowSelection: (tableKey, rowSelection) => {
        tableStateActions.setTableState(tableKey, { rowSelection })
      },

      setPagination: (tableKey, pagination) => {
        tableStateActions.setTableState(tableKey, { pagination })
      },

      setSorts: (tableKey, sorts) => {
        tableStateActions.setTableState(tableKey, { sorts })
      },

      setFilters: (tableKey, filters) => {
        tableStateActions.setTableState(tableKey, { filters })
      },

      cleanupTableState: (tableKey) => {
        setState((prev) => {
          const newTableStates = { ...prev.tableStates }
          delete newTableStates[tableKey]
          return { ...prev, tableStates: newTableStates }
        })
      },
    }),
  })

export { tableStateActions, tableStateStore, useTableStateStore }

