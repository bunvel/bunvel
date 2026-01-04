import { useCallback } from 'react'
import { toast } from 'sonner'

export function useCopy() {
  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        throw new Error('Clipboard API not supported in this browser')
      }

      // Check clipboard permissions if supported
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName })
          if (permission.state === 'denied') {
            throw new Error('Clipboard write permission denied')
          }
        } catch (error) {
          // Ignore all errors from permission query; if truly denied, the clipboard operation will fail
          // Only check if we got an explicit 'denied' state (handled above)
        }
      }

      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        return false
      }
    },
    [],
  )

  // Update the copyRows function to handle different formats
  const copyRows = useCallback(
    async (
      rows: any[],
      format: 'json' | 'csv' | 'sql' = 'json',
      tableName: string,
    ) => {
      try {
        let text = ''

        if (format === 'json') {
          text = JSON.stringify(rows, null, 2)
        } else if (format === 'csv') {
          if (rows.length === 0) return false

          const headers = Object.keys(rows[0])
          const csvRows = [
            headers.join(','),
            ...rows.map((row) =>
              headers
                .map((field) => {
                  const value = row[field] ?? ''
                  return `"${value.toString().replace(/"/g, '""')}"`
                })
                .join(','),
            ),
          ]
          text = csvRows.join('\n')
        } else if (format === 'sql') {
          // Simple SQL insert statements
          const columns = Object.keys(rows[0] || {})
          const values = rows
            .map(
              (row) =>
                `(${columns
                  .map((col) => {
                    const val = row[col]
                    if (val === null || val === undefined) return 'NULL'
                    if (typeof val === 'string')
                      return `'${val.replace(/'/g, "''")}'`
                    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
                    return val
                  })
                  .join(', ')})`,
            )
            .join(',\n')

          text = `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n${values};`
        }

        const success = await copyToClipboard(text)
        if (success) {
          toast.success('Copied to clipboard')
          return true
        }
        toast.error('Failed to copy to clipboard. Please check browser permissions.')
        return false
      } catch (err) {
        console.error('Failed to copy rows:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to copy to clipboard'
        toast.error(errorMessage)
        return false
      }
    },
    [copyToClipboard],
  )

  return {
    copyToClipboard,
    copyRows,
  }
}
