import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCopy } from '@/hooks/use-copy'
import { BUTTON_LABELS } from '@/utils/constant'
import { ArrowDown, ArrowRight, Code, Copy } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import React, { useState } from 'react'

interface JsonViewSheetProps {
  schema: string
  table: string
  data: any[]
  disabled?: boolean
}

interface JsonNodeProps {
  data: any
  isLast: boolean
  expandAll?: boolean
  collapseAll?: boolean
}

const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  isLast,
  expandAll,
  collapseAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  // React to expand/collapse all commands
  React.useEffect(() => {
    if (expandAll) {
      setIsExpanded(true)
    } else if (collapseAll) {
      setIsExpanded(false)
    }
  }, [expandAll, collapseAll])

  const isObject =
    typeof data === 'object' && data !== null && !Array.isArray(data)
  const isArray = Array.isArray(data)

  const renderValue = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'number' || typeof value === 'boolean')
      return String(value)
    return typeof value
  }

  if (!isObject && !isArray) {
    return (
      <span className="text-green-400">
        {renderValue(data)}
        {!isLast && <span className="text-gray-400">,</span>}
      </span>
    )
  }

  const entries = Object.entries(data)
  const itemCount = entries.length

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger>
        <span className="flex items-center cursor-pointer hover:text-gray-300">
          <HugeiconsIcon
            icon={isExpanded ? ArrowDown : ArrowRight}
            className="h-3 w-3 mr-1"
          />
          <span className="text-gray-400">
            {!isExpanded && (
              <>
                {isArray ? '[' : '{'}
                <span className="text-gray-500 ml-1">
                  {itemCount} {isArray ? 'items' : 'properties'}
                </span>
                {isArray ? ']' : '}'}
              </>
            )}
            {isExpanded && (isArray ? '[' : '{')}
          </span>
        </span>
      </CollapsibleTrigger>
      {isExpanded && (
        <CollapsibleContent>
          <div className="ml-4 border-l border-gray-700 pl-4">
            {entries.map(([key, value], index) => (
              <div key={key} className="py-1">
                <span className="text-blue-400">
                  {isArray ? '' : `"${key}": `}
                </span>
                <JsonNode
                  data={value}
                  isLast={index === itemCount - 1}
                  expandAll={expandAll}
                  collapseAll={collapseAll}
                />
              </div>
            ))}
          </div>
          <span className="text-gray-400">
            {isArray ? ']' : '}'}
            {!isLast && <span className="text-gray-400">,</span>}
          </span>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

export function JsonViewSheet({
  schema,
  table,
  data,
  disabled,
}: JsonViewSheetProps) {
  const [open, setOpen] = useState(false)
  const [expandAll, setExpandAll] = useState(false)
  const [collapseAll, setCollapseAll] = useState(false)
  const { copyRows } = useCopy()

  // Ensure data is always an array
  const dataArray = Array.isArray(data) ? data : []

  const handleCopyJson = async () => {
    await copyRows(dataArray, {
      format: 'json',
      tableName: `${schema}.${table}`,
    })
  }

  const handleExpandAll = () => {
    setExpandAll(true)
    setCollapseAll(false)
    // Reset the trigger after a brief moment to allow re-render
    setTimeout(() => setExpandAll(false), 100)
  }

  const handleCollapseAll = () => {
    setCollapseAll(true)
    setExpandAll(false)
    // Reset the trigger after a brief moment to allow re-render
    setTimeout(() => setCollapseAll(false), 100)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" disabled={disabled}>
            <HugeiconsIcon icon={Code} className="h-4 w-4" />
          </Button>
        }
      ></SheetTrigger>
      <SheetContent side="right" className="bg-card min-w-2xl flex flex-col">
        <SheetHeader className="border-b p-4">
          <SheetTitle>
            JSON View - {schema}.{table}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {dataArray.length} record
              {dataArray.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExpandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={handleCollapseAll}>
                Collapse All
              </Button>
              <Button variant="outline" size="icon-sm" onClick={handleCopyJson}>
                <HugeiconsIcon icon={Copy} className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-md p-4">
            <pre className="text-sm font-mono">
              {dataArray.length === 0 ? (
                <span className="text-gray-500">No data to display</span>
              ) : dataArray.length === 1 ? (
                <JsonNode
                  data={dataArray[0]}
                  isLast={true}
                  expandAll={expandAll}
                  collapseAll={collapseAll}
                />
              ) : (
                <>
                  <span className="text-gray-400">[</span>
                  <div className="ml-4">
                    {dataArray.map((record, index) => (
                      <div key={index} className="py-1">
                        <JsonNode
                          data={record}
                          isLast={index === dataArray.length - 1}
                          expandAll={expandAll}
                          collapseAll={collapseAll}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-400">]</span>
                </>
              )}
            </pre>
          </div>
        </div>
        <SheetFooter className="p-4 border-t flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {BUTTON_LABELS.CANCEL}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
