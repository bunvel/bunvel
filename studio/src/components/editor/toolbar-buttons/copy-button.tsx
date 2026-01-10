import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCopy } from '@/hooks/use-copy'
import {
  ArrowDown,
  Files as FileJson,
  File as FileText,
  Database as FileTypeSql,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface CopyButtonProps {
  selectedRows: Record<string, unknown>[]
  table: string
}

export function CopyButton({ selectedRows, table }: CopyButtonProps) {
  const { copyRows } = useCopy()

  const handleCopy = (format: 'json' | 'csv' | 'sql') => {
    copyRows(selectedRows, { format, tableName: table })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            <span>Copy</span>
            <HugeiconsIcon icon={ArrowDown} className="h-4 w-4" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleCopy('json')
          }}
        >
          <HugeiconsIcon icon={FileJson} className="mr-2 h-4 w-4" />
          <span>Copy as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleCopy('csv')
          }}
        >
          <HugeiconsIcon icon={FileText} className="mr-2 h-4 w-4" />
          <span>Copy as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleCopy('sql')
          }}
          disabled={!table}
        >
          <HugeiconsIcon icon={FileTypeSql} className="mr-2 h-4 w-4" />
          <span>Copy as SQL</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
