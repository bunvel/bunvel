import type { TableTabsState } from '@/types/table'
import { createStore } from './create-store'

export interface TableTabsStoreState {
  tabs: TableTabsState
}

export interface TableTabsActions {
  addTable: (schema: string, table: string, maxTabs?: number) => void
  removeTable: (tableKey: string) => void
  removeTableBySchema: (schema: string, table: string) => void
  setActiveTable: (tableKey: string | null) => void
  setMaxTabs: (maxTabs: number) => void
  clearAllTabs: () => void
}

const DEFAULT_TABS_STATE: TableTabsState = {
  selectedTables: [],
  maxTabs: 5,
  activeTableKey: null,
}

const { store: tableTabsStore, actions: tableTabsActions, useStore: useTableTabsStore } =
  createStore<TableTabsStoreState, TableTabsActions>({
    name: 'table-tabs',
    initialState: {
      tabs: DEFAULT_TABS_STATE,
    },
    actions: (setState, getState) => ({
      addTable: (schema, table, maxTabs) => {
        const tableKey = `${schema}.${table}`
        const { tabs } = getState()
        const actualMaxTabs = maxTabs ?? tabs.maxTabs

        setState((prev) => ({
          ...prev,
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

      removeTable: (tableKey) => {
        setState((prev) => ({
          ...prev,
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
        }))
      },

      removeTableBySchema: (schema, table) => {
        const tableKey = `${schema}.${table}`
        tableTabsActions.removeTable(tableKey)
      },

      setActiveTable: (tableKey) => {
        setState((prev) => ({
          ...prev,
          tabs: {
            ...prev.tabs,
            activeTableKey: tableKey,
          },
        }))
      },

      setMaxTabs: (maxTabs) => {
        setState((prev) => ({
          ...prev,
          tabs: {
            ...prev.tabs,
            maxTabs,
          },
        }))
      },

      clearAllTabs: () => {
        setState(() => ({
          tabs: DEFAULT_TABS_STATE,
        }))
      },
    }),
  })

export { tableTabsActions, tableTabsStore, useTableTabsStore }

