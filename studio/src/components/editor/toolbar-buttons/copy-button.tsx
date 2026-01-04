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
import { toast } from 'sonner'

interface CopyButtonProps {
  selectedRows: Record<string, unknown>[]
  table?: string
}

export function CopyButton({ selectedRows, table }: CopyButtonProps) {
  const { copyRows } = useCopy()

  const handleCopy = async (format: 'json' | 'csv' | 'sql') => {
    try {
      const success = await copyRows(
        selectedRows,
        format,
        format === 'sql' ? table : undefined,
      )

      if (success) {
        toast.success(`Copied ${selectedRows.length} rows as ${format.toUpperCase()} to clipboard`)
      } else {
        toast.error('Failed to copy rows')
      }
    } catch (error) {
      toast.error('An error occurred while copying')
    }
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
