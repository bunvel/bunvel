import ExplorerSidebar from '@/components/explorer/ExplorerSidebar';
import TableViewer from '@/components/explorer/TableViewer';
import { QUERY_URL } from '@/lib/constant';
import { createFileRoute } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type TableTab = {
  id: string;
  schema: string;
  table: string;
  data: Record<string, any>[];
  columns: string[];
  isLoading: boolean;
  page: number;
  totalRows: number;
};

export const Route = createFileRoute('/(main)/explorer/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [tabs, setTabs] = useState<TableTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(100)

  const fetchTableData = async (schema: string, table: string, page: number) => {
    const tabId = `${schema}.${table}`
    
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, isLoading: true }
          : tab
      )
    )
    
    try {
      // First, get the total count
      const countResponse = await fetch(QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `SELECT COUNT(*) as count FROM "${schema}"."${table}"`
        })
      })
      
      if (!countResponse.ok) {
        throw new Error('Failed to fetch table row count')
      }
      
      const countData = await countResponse.json()
      const totalCount = countData?.[0]?.count || 0
      
      // Then fetch the paginated data
      const offset = (page - 1) * pageSize
      const response = await fetch(QUERY_URL, {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `SELECT * FROM "${schema}"."${table}" LIMIT ${pageSize} OFFSET ${offset}`
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch table data')
        }
        
        const data = await response.json()
        let columns: string[] = []
        
        if (data && data.length > 0) {
          columns = Object.keys(data[0])
        }
        
        setTabs(prevTabs =>
          prevTabs.map(tab =>
            tab.id === tabId
              ? {
                  ...tab,
                  data,
                  columns,
                  isLoading: false,
                  page,
                  totalRows: Number(totalCount)
                }
              : tab
          )
        )
      } catch (error) {
        console.error('Error fetching table data:', error)
        toast.error('Failed to load table data')
        setTabs(prevTabs =>
          prevTabs.map(tab =>
            tab.id === tabId
              ? { ...tab, isLoading: false, data: [], columns: [] }
              : tab
          )
        )
      }
    }

  const handleTableSelect = async (schema: string, table: string) => {
    const tabId = `${schema}.${table}`
    
    // If tab already exists, just activate it
    const existingTab = tabs.find(tab => tab.id === tabId)
    if (existingTab) {
      setActiveTabId(tabId)
      return
    }
    
    // Add new tab and set as active
    const newTab: TableTab = {
      id: tabId,
      schema,
      table,
      data: [],
      columns: [],
      isLoading: true,
      page: 1,
      totalRows: 0
    }
    
    setTabs(prevTabs => [...prevTabs, newTab])
    setActiveTabId(tabId)
    
    // Fetch data for the new tab
    await fetchTableData(schema, table, 1)
  }

  const handlePageChange = (tabId: string, newPage: number) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      setTabs(prevTabs =>
        prevTabs.map(t => (t.id === tabId ? { ...t, page: newPage } : t))
      )
      fetchTableData(tab.schema, tab.table, newPage)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    if (activeTabId) {
      const tab = tabs.find(t => t.id === activeTabId)
      if (tab) {
        setTabs(prevTabs =>
          prevTabs.map(t => (t.id === activeTabId ? { ...t, page: 1 } : t))
        )
        fetchTableData(tab.schema, tab.table, 1)
      }
    }
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId)
  
  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId)
      // If we're closing the active tab, activate another one or set to null
      if (tabId === activeTabId) {
        const currentIndex = prevTabs.findIndex(tab => tab.id === tabId)
        const newActiveTab = newTabs[Math.min(currentIndex, newTabs.length - 1)]
        setActiveTabId(newActiveTab?.id || null)
      }
      return newTabs
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full">
        <div className="w-64 border-r border-border">
          <ExplorerSidebar 
            onTableSelect={handleTableSelect} 
            selectedTable={activeTab ? { schema: activeTab.schema, table: activeTab.table } : undefined} 
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {tabs.length > 0 && (
            <div className="flex border-b border-border bg-background">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium border-r border-border cursor-pointer transition-colors ${
                    activeTabId === tab.id 
                      ? 'bg-card text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="mr-2">{tab.table}</span>
                  <button
                    onClick={e => closeTab(tab.id, e)}
                    className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {activeTab ? (
              <TableViewer
                table={activeTab.table}
                columns={activeTab.columns}
                data={activeTab.data}
                isLoading={activeTab.isLoading}
                onPageChange={(newPage) => handlePageChange(activeTab.id, newPage)}
                currentPage={activeTab.page}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a table to view its data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
