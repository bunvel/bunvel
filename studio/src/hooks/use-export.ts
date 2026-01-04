import { useCallback } from 'react'

type ExportFormat = 'json' | 'csv' | 'sql'

export function useExport() {
  const exportData = useCallback(
    async <T extends Record<string, any>>(
      data: T[],
      fileName: string,
      format: ExportFormat = 'json',
      tableName: string,
    ): Promise<boolean> => {
      try {
        if (!data || data.length === 0) {
          console.error('No data provided for export')
          return false
        }

        let content = ''
        let mimeType = 'text/plain'
        let fileExtension = 'txt'

        if (format === 'json') {
          content = JSON.stringify(data, null, 2)
          mimeType = 'application/json'
          fileExtension = 'json'
        } else if (format === 'csv') {
          const headers = Object.keys(data[0])
          const csvRows = [
            headers.join(','),
            ...data.map((row) =>
              headers
                .map((field) => {
                  const value = row[field] ?? ''
                  const stringValue = typeof value === 'object' && value !== null
                    ? JSON.stringify(value)
                    : String(value)
                  return `"${stringValue.replace(/"/g, '""')}"`
                })
                .join(','),
            ),
          ]

          content = csvRows.join('\n')
          mimeType = 'text/csv'
          fileExtension = 'csv'
        } else if (format === 'sql') {
          const columns = Object.keys(data[0] || {})
          const values = data
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

          content = `-- SQL Export for ${tableName}\n\n`
          content += `-- Table structure would go here\n-- CREATE TABLE IF NOT EXISTS ${tableName} (...);\n\n`
          content += `-- Data\nINSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n${values};\n`
          fileExtension = 'sql'
        }

        const blob = new Blob([content], {
          type: `${mimeType};charset=utf-8;`,
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = `${fileName}.${fileExtension}`
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Cleanup blob URL after short delay
        setTimeout(() => URL.revokeObjectURL(url), 100)

        return true
      } catch (error) {
        console.error('Export failed:', error)
        return false
      }
    },
    [],
  )

  return { exportData }
}
