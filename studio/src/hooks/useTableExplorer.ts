import Endpoints from '@/data/endpoints'
import { useState } from 'react'
import { toast } from 'sonner'

export interface TableTab {
  id: string
  schema: string
  table: string
  data: Record<string, any>[]
  columnTypes: Record<string, string>
  columns: string[]
  isLoading: boolean
  page: number
  totalRows: number
}

export const useTableExplorer = () => {
  const [tabs, setTabs] = useState<TableTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(50)

  const fetchTableData = async (
    schema: string,
    table: string,
    page: number,
  ) => {
    const tabId = `${schema}.${table}`

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, isLoading: true } : tab,
      ),
    )

    try {
      // Fetch column types
      const columnTypesResponse = await fetch(Endpoints.QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            SELECT column_name,
                   data_type
            FROM information_schema.columns
            WHERE table_schema = '${schema}'
              AND table_name = '${table}'
            ORDER BY ordinal_position
          `,
        }),
      })

      if (!columnTypesResponse.ok) {
        throw new Error('Failed to fetch column types')
      }

      const columnTypesData = await columnTypesResponse.json()
      const columnTypes = columnTypesData.reduce(
        (acc: Record<string, string>, row: any) => {
          acc[row.column_name] = row.data_type
          return acc
        },
        {},
      )

      // Fetch table data with pagination
      const offset = (page - 1) * pageSize
      const dataResponse = await fetch(Endpoints.QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            SELECT *
            FROM \"${schema}\".\"${table}\"
            LIMIT ${pageSize} OFFSET ${offset}
          `,
        }),
      })

      if (!dataResponse.ok) {
        throw new Error('Failed to fetch table data')
      }

      const data = await dataResponse.json()

      // Get total row count for pagination
      const countResponse = await fetch(Endpoints.QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `SELECT COUNT(*) as count FROM \"${schema}\".\"${table}\"`,
        }),
      })

      if (!countResponse.ok) {
        throw new Error('Failed to fetch row count')
      }

      const countData = await countResponse.json()
      const totalRows = Number(countData[0]?.count) || 0

      const newTab: TableTab = {
        id: tabId,
        schema,
        table,
        data,
        columnTypes,
        columns: Object.keys(columnTypes),
        isLoading: false,
        page,
        totalRows,
      }

      setTabs((prevTabs) => {
        const existingTabIndex = prevTabs.findIndex((tab) => tab.id === tabId)
        if (existingTabIndex >= 0) {
          const newTabs = [...prevTabs]
          newTabs[existingTabIndex] = newTab
          return newTabs
        }
        return [...prevTabs, newTab]
      })

      setActiveTabId(tabId)
    } catch (error) {
      console.error('Error fetching table data:', error)
      toast.error('Failed to load table data')
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId ? { ...tab, isLoading: false } : tab,
        ),
      )
    }
  }

  const closeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab.id !== tabId)
      if (activeTabId === tabId) {
        setActiveTabId(
          newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null,
        )
      }
      return newTabs
    })
  }

  const handlePageChange = (tabId: string, newPage: number) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (tab) {
      fetchTableData(tab.schema, tab.table, newPage)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    if (activeTab) {
      fetchTableData(activeTab.schema, activeTab.table, 1)
    }
  }

  return {
    tabs,
    activeTabId,
    pageSize,
    setActiveTabId,
    fetchTableData,
    closeTab,
    handlePageChange,
    handlePageSizeChange,
  }
}

export default useTableExplorer
