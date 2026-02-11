import { useCallback, useState } from 'react'
import { toast } from 'sonner'

type CopiedValue = string | null
type CopyFn = (text: string) => Promise<boolean>

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      toast.warning('Clipboard not supported in this browser')
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      return true
    } catch (error) {
      setCopiedText(null)
      toast.error(
        'Failed to copy to clipboard. Please check browser permissions.',
      )
      return false
    }
  }, [])

  return [copiedText, copy]
}
