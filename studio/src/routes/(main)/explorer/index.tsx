import ExplorerSidebar from '@/components/explorer/ExplorerSidebar'
import TableViewer from '@/components/explorer/TableViewer'
import useTableExplorer from '@/hooks/useTableExplorer'
import { createFileRoute } from '@tanstack/react-router'
import { X } from 'lucide-react'

export const Route = createFileRoute('/(main)/explorer/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    tabs,
    activeTabId,
    pageSize,
    setActiveTabId,
    fetchTableData,
    closeTab,
    handlePageChange,
    handlePageSizeChange,
    insertRow,
  } = useTableExplorer()

  const handleTableSelect = (schema: string, table: string) => {
    const tabId = `${schema}.${table}`
    const existingTab = tabs.find((tab) => tab.id === tabId)

    if (!existingTab) {
      // Tab doesn't exist, fetch data for the new tab
      fetchTableData(schema, table, 1)
    } else {
      // Tab exists, just switch to it
      setActiveTabId(tabId)
    }
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full">
        <div className="w-64 border-r border-border">
          <ExplorerSidebar
            onTableSelect={handleTableSelect}
            selectedTable={
              activeTab
                ? { schema: activeTab.schema, table: activeTab.table }
                : undefined
            }
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {tabs.length > 0 && (
            <div className="flex border-b border-border bg-background">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium border-r border-border cursor-pointer transition-colors ${
                    activeTabId === tab.id
                      ? 'bg-card text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  title={`${tab.schema}.${tab.table}`}
                >
                  <span className="mr-2">
                    <span className="text-muted-foreground text-xs">{tab.schema}.</span>
                    {tab.table}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
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
                schema={activeTab.schema}
                columns={activeTab.columns}
                columnTypes={activeTab.columnTypes}
                data={activeTab.data}
                isLoading={activeTab.isLoading}
                onPageChange={(newPage) =>
                  handlePageChange(activeTab.id, newPage)
                }
                currentPage={activeTab.page}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
                onInsert={
                  activeTab && activeTab.schema !== 'auth' 
                    ? (data) => insertRow(activeTab.id, data).then(() => {}) 
                    : undefined
                }
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
