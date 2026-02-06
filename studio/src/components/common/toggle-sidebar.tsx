import { Button } from '@/components/ui/button'
import { SCREEN_READER_LABELS } from '@/constants/ui'
import { PanelLeft, PanelLeftClose } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface ToggleSidebarProps {
  onToggleSidebar?: () => void
  showSidebar: boolean
}

export function ToggleSidebar({
  onToggleSidebar,
  showSidebar,
}: ToggleSidebarProps) {
  return (
    <Button
      type="button"
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
      <span className="sr-only">{SCREEN_READER_LABELS.TOGGLE_SIDEBAR}</span>
    </Button>
  )
}
