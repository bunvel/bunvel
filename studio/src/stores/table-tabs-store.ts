import { useSelector } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import type { TableTabsState } from '@/types/table'

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

const tableTabsStore = new Store<TableTabsStoreState>({
  tabs: DEFAULT_TABS_STATE,
})

export const tableTabsActions: TableTabsActions = {
  addTable: (schema: string, table: string, maxTabs?: number) => {
    const tableKey = `${schema}.${table}`
    const { tabs } = tableTabsStore.get()
    const actualMaxTabs = maxTabs ?? tabs.maxTabs

    tableTabsStore.setState((prev) => ({
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

  removeTable: (tableKey: string) => {
    tableTabsStore.setState((prev) => ({
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

  removeTableBySchema: (schema: string, table: string) => {
    const tableKey = `${schema}.${table}`
    tableTabsActions.removeTable(tableKey)
  },

  setActiveTable: (tableKey: string | null) => {
    tableTabsStore.setState((prev) => ({
      ...prev,
      tabs: {
        ...prev.tabs,
        activeTableKey: tableKey,
      },
    }))
  },

  setMaxTabs: (maxTabs: number) => {
    tableTabsStore.setState((prev) => ({
      ...prev,
      tabs: {
        ...prev.tabs,
        maxTabs,
      },
    }))
  },

  clearAllTabs: () => {
    tableTabsStore.setState(() => ({
      tabs: DEFAULT_TABS_STATE,
    }))
  },
}

export function useTableTabsStore<T>(selector: (state: TableTabsStoreState) => T): T {
  return useSelector(tableTabsStore, selector)
}
