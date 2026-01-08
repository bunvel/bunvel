import { Button } from '@/components/ui/button'
import { Database02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

interface GenerateDataButtonProps {
  schema: string
  table: string
  kind: string
}

export function GenerateDataButton({
  schema,
  table,
  kind,
}: GenerateDataButtonProps) {
  const onClick = () => {
    console.log('Generate Data', schema, table, kind)
    toast.info('Generate Data functionality not yet implemented', {
      description: 'Generating data will be available in a future update',
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1"
      disabled={kind !== 'r'}
    >
      <HugeiconsIcon icon={Database02Icon} className="h-4 w-4" />
      <span>Generate Data</span>
    </Button>
  )
}
