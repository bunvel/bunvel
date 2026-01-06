import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'

interface SearchParams {
  schema?: string
  table?: string
}

export function TableTabs() {
  const navigate = useNavigate()
  const { schema, table } = useSearch({ strict: false }) as SearchParams
  const [selectedTables, setSelectedTables] = useState<string[]>(() => 
    schema && table ? [`${schema}.${table}`] : []
  )

  const handleTabChange = (value: string) => {
    const [schema, table] = value.split('.')
    navigate({ search: { schema, table } as any })
  }

  const handleTabClose = (e: React.MouseEvent, tableKey: string) => {
    e.stopPropagation()
    const newTables = selectedTables.filter((t) => t !== tableKey)
    setSelectedTables(newTables)

    if (tableKey === `${schema}.${table}`) {
      const [newSchema, newTable] = newTables[0]?.split('.') || []
      navigate(newTable ? { search: { schema: newSchema, table: newTable } as any } : { search: {} as any })
    }
  }

  // Update selected tables when URL changes
  useEffect(() => {
    if (schema && table) {
      const tableKey = `${schema}.${table}`
      setSelectedTables(prev => 
        prev.includes(tableKey) ? prev : 
        prev.length >= 5 ? [...prev.slice(0, 4), tableKey] : [...prev, tableKey]
      )
    }
  }, [schema, table])

  if (!selectedTables.length) return null

  return (
    <Tabs value={`${schema}.${table}`} onValueChange={handleTabChange}>
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
                <span className="text-xs text-muted-foreground mx-1">{tabSchema}</span>
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
  )
}
