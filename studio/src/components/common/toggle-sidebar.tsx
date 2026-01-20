import { Button } from '@/components/ui/button'
import { PanelLeft, PanelLeftClose } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface ToggleSidebarProps {
  onToggleSidebar?: () => void | undefined
  showSidebar: boolean
}

export function ToggleSidebar({
  onToggleSidebar,
  showSidebar,
}: ToggleSidebarProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onToggleSidebar?.()}
      className="h-8 w-8 p-0"
    >
      {showSidebar ? (
        <HugeiconsIcon icon={PanelLeftClose} className="h-4 w-4" />
      ) : (
        <HugeiconsIcon icon={PanelLeft} className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
