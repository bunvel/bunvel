import { logger } from '@/lib/logger'
import { EXPORT_FORMATS, ExportFormat } from '@/utils/constant'
import { escapeIdentifier } from '@/utils/func'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from './use-clipboard'

interface CopyOptions {
  format?: ExportFormat
  tableName?: string
  delimiter?: string
  lineTerminator?: string
}

export function useCopy() {
  const [, copyToClipboard] = useCopyToClipboard()

  const escapeCsvValue = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (
      str.includes('"') ||
      str.includes(',') ||
      str.includes('\n') ||
      str.includes('\r')
    ) {
      return `"${escapeIdentifier(str)}"`
    }
    return str
  }

  const copyRows = useCallback(
    async <T extends Record<string, unknown>>(
      rows: T[],
      options: CopyOptions = {},
    ): Promise<boolean> => {
      const {
        format = EXPORT_FORMATS.JSON,
        tableName = 'table_name',
        delimiter = ',',
        lineTerminator = '\n',
      } = options

      try {
        if (rows.length === 0) {
          toast.warning('No data to copy')
          return false
        }

        let text = ''

        if (format === EXPORT_FORMATS.JSON) {
          text = JSON.stringify(rows, null, 2)
        } else if (format === EXPORT_FORMATS.CSV) {
          const headers = Object.keys(rows[0] || {})
          const csvRows = rows.map((row) =>
            headers
              .map((header) => escapeCsvValue(row[header]))
              .join(delimiter),
          )
          csvRows.unshift(headers.map(escapeCsvValue).join(delimiter))
          text = csvRows.join(lineTerminator)
        } else if (format === EXPORT_FORMATS.SQL) {
          if (!tableName) {
            throw new Error('Table name is required for SQL format')
          }

          const columns = Object.keys(rows[0] || {})
          const escapedTableName = escapeIdentifier(tableName)
          const escapedColumns = columns.map(escapeIdentifier)

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
                    if (typeof val === 'number') return val.toString()
                    return `'${JSON.stringify(val).replace(/'/g, "''")}'`
                  })
                  .join(', ')})`,
            )
            .join(',\n')

          text = `INSERT INTO ${escapedTableName} (${escapedColumns.join(', ')})\nVALUES\n${values};`
        }

        const success = await copyToClipboard(text)
        if (success) {
          toast.success(
            `Copied ${rows.length} ${rows.length === 1 ? 'row' : 'rows'} to clipboard`,
          )
          return true
        }
        return false
      } catch (err) {
        logger.hook('use-copy').error('Failed to copy rows', err)
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to process data'
        toast.error(errorMessage)
        return false
      }
    },
    [copyToClipboard],
  )

  return {
    copyRows,
    copyToClipboard,
  }
}
