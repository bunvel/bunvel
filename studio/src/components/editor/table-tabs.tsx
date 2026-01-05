import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '../ui/button'

interface SearchParams {
  schema?: string
  table?: string
}

export function TableTabs() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as SearchParams
  const { schema, table } = search
  const [selectedTables, setSelectedTables] = useState<string[]>(() => {
    return schema && table ? [`${schema}.${table}`] : []
  })

  const handleTabChange = useCallback(
    (value: string) => {
      const [schema, table] = value.split('.')
      navigate({
        search: {
          schema,
          table,
        } as any,
      })
    },
    [navigate],
  )

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tableKey: string) => {
      e.stopPropagation()
      const newTables = selectedTables.filter((t) => t !== tableKey)
      setSelectedTables(newTables)

      // If closing the active tab, switch to another tab if available
      if (tableKey === `${schema}.${table}`) {
        const [newSchema, newTable] = newTables[0]?.split('.') || []
        if (newTable) {
          navigate({
            search: {
              schema: newSchema,
              table: newTable,
            } as any,
          })
        } else {
          navigate({ search: {} as any })
        }
      }
    },
    [selectedTables, schema, table, navigate],
  )

  // Update selected tables when URL changes
  useEffect(() => {
    if (schema && table) {
      const tableKey = `${schema}.${table}`
      if (!selectedTables.includes(tableKey)) {
        setSelectedTables((prev) => {
          // If we already have 5 tabs, replace the last one
          if (prev.length >= 5) {
            return [...prev.slice(0, 4), tableKey]
          }
          return [...prev, tableKey]
        })
      }
    }
  }, [schema, table])

  const handleClearAll = useCallback(() => {
    setSelectedTables([])
    navigate({ search: {} as any })
  }, [navigate])

  if (selectedTables.length === 0) return null

  return (
    <div className="border-b flex items-center">
      <Tabs
        value={`${schema}.${table}`}
        onValueChange={handleTabChange}
        className="flex-1"
      >
        <TabsList className="inline-flex justify-start rounded-none bg-card p-0">
          {selectedTables.map((tableKey) => {
            const [tabSchema, tabTable] = tableKey.split('.')
            const isActive = schema === tabSchema && table === tabTable

            return (
              <TabsTrigger
                key={tableKey}
                value={tableKey}
                className={`group relative border-none rounded-none px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 shrink-0 ${
                  isActive
                    ? 'text-foreground bg-muted/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground mx-1">
                    {tabSchema}
                  </span>
                  <span>{tabTable}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleTabClose(e, tableKey)}
                    className="ml-1 h-5 w-5 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted/50"
                  >
                    <HugeiconsIcon icon={X} className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
      {selectedTables.length > 1 && (
        <Button onClick={handleClearAll} title="Close all tabs" variant="link">
          Clear All
        </Button>
      )}
    </div>
  )
}
