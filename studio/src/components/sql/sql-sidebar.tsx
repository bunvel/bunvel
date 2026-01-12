import { cn } from "@/lib/utils"
import { QueryHistory, QueryHistoryItem } from "./query-history"

interface SqlSidebarProps {
  isOpen: boolean
  history: QueryHistoryItem[]
  onSelect: (query: string) => void
  onClear: () => void
  className?: string
}

export function SqlSidebar({
  isOpen,
  history,
  onSelect,
  onClear,
  className,
}: SqlSidebarProps) {
  return (
    <div
      className={cn(
        "w-[20%] border-r transition-all duration-200 overflow-hidden bg-card",
        !isOpen && "w-0 opacity-0",
        className
      )}
    >
      <QueryHistory
        history={history}
        onSelect={onSelect}
        onClear={onClear}
        className="h-full"
      />
    </div>
  )
}
