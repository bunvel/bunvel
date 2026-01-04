import { useCallback } from 'react'
import { toast } from 'sonner'

export function useCopy() {
  const copyToClipboard = useCallback(
    async (text: string, errorMessage?: string) => {
      try {
        // Modern clipboard API with permission handling
        if (!navigator.clipboard) {
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

        await navigator.clipboard.writeText(text)

        return true
      } catch (err) {
        console.error('Failed to copy:', err)
        const errorMsg = errorMessage || 'Failed to copy to clipboard. Please check browser permissions.'
        toast.error(errorMsg)
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
        } else if (format === 'sql' && tableName) {
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

        return await copyToClipboard(text, 'Copied to clipboard')
      } catch (err) {
        console.error('Failed to copy rows:', err)
        toast.error('Failed to copy rows')
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
