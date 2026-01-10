import { useCallback } from 'react'
import { toast } from 'sonner'

interface CopyOptions {
  format?: 'json' | 'csv' | 'sql'
  tableName?: string
  delimiter?: string
  lineTerminator?: string
}

export function useCopy() {
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      toast.warning('Clipboard not supported in this browser')
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      toast.error('Failed to copy to clipboard. Please check browser permissions.')
      return false
    }
  }, [])

  const escapeCsvValue = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const escapeSqlIdentifier = (identifier: string): string => {
    return `"${identifier.replace(/"/g, '""')}"`
  }

  const copyRows = useCallback(
    async <T extends Record<string, unknown>>(
      rows: T[],
      options: CopyOptions = {}
    ): Promise<boolean> => {
      const {
        format = 'json',
        tableName = 'table_name',
        delimiter = ',',
        lineTerminator = '\n'
      } = options

      try {
        if (rows.length === 0) {
          toast.warning('No data to copy')
          return false
        }

        let text = ''

        if (format === 'json') {
          text = JSON.stringify(rows, null, 2)
        } else if (format === 'csv') {
          const headers = Object.keys(rows[0] || {})
          const csvRows = rows.map(row => 
            headers
              .map(header => escapeCsvValue(row[header]))
              .join(delimiter)
          )
          csvRows.unshift(headers.map(escapeCsvValue).join(delimiter))
          text = csvRows.join(lineTerminator)
        } else if (format === 'sql') {
          if (!tableName) {
            throw new Error('Table name is required for SQL format')
          }
          
          const columns = Object.keys(rows[0] || {})
          const escapedTableName = escapeSqlIdentifier(tableName)
          const escapedColumns = columns.map(escapeSqlIdentifier)
          
          const values = rows.map(row => 
            `(${columns
              .map(col => {
                const val = row[col]
                if (val === null || val === undefined) return 'NULL'
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
                if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
                if (typeof val === 'number') return val.toString()
                return `'${JSON.stringify(val).replace(/'/g, "''")}'`
              })
              .join(', ')})`
          ).join(',\n')

          text = `INSERT INTO ${escapedTableName} (${escapedColumns.join(', ')})\nVALUES\n${values};`
        }

        const success = await copyToClipboard(text)
        if (success) {
          toast.success(`Copied ${rows.length} ${rows.length === 1 ? 'row' : 'rows'} to clipboard`)
          return true
        }
        return false
      } catch (err) {
        console.error('Failed to copy rows:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to process data'
        toast.error(errorMessage)
        return false
      }
    },
    [copyToClipboard]
  )

  return {
    copyToClipboard,
    copyRows,
  }
}