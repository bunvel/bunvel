import { useCallback } from 'react'

interface ExportOptions {
  format?: 'json' | 'csv' | 'sql'
  tableName?: string
  delimiter?: string
  lineTerminator?: string
  includeTableStructure?: boolean
}

export function useExport() {
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

  const generateTableStructure = (columns: string[], tableName: string): string => {
    // This is a simplified version - in a real app, you'd want to include column types
    const escapedTableName = escapeSqlIdentifier(tableName)
    const columnDefinitions = columns
      .map(col => `  ${escapeSqlIdentifier(col)} TEXT`)
      .join(',\n')
    
    return `-- Table structure for ${escapedTableName}\n` +
           `CREATE TABLE IF NOT EXISTS ${escapedTableName} (\n` +
           `${columnDefinitions}\n` +
           ');\n\n'
  }

  const exportData = useCallback(
    async <T extends Record<string, unknown>>(
      data: T[],
      fileName: string,
      options: ExportOptions = {}
    ): Promise<boolean> => {
      try {
        if (!data || data.length === 0) {
          console.error('No data provided for export')
          return false
        }

        const {
          format = 'json',
          tableName = 'exported_data',
          delimiter = ',',
          lineTerminator = '\n',
          includeTableStructure = true
        } = options

        let content = ''
        let mimeType = 'text/plain'
        let fileExtension = 'txt'

        if (format === 'json') {
          content = JSON.stringify(data, null, 2)
          mimeType = 'application/json'
          fileExtension = 'json'
        } else if (format === 'csv') {
          const headers = Object.keys(data[0] || {})
          const csvRows = data.map(row => 
            headers
              .map(header => escapeCsvValue(row[header]))
              .join(delimiter)
          )
          csvRows.unshift(headers.map(escapeCsvValue).join(delimiter))
          content = csvRows.join(lineTerminator)
          mimeType = 'text/csv'
          fileExtension = 'csv'
        } else if (format === 'sql') {
          const columns = Object.keys(data[0] || {})
          const escapedTableName = escapeSqlIdentifier(tableName)
          const escapedColumns = columns.map(escapeSqlIdentifier)
          
          content = ''

          if (includeTableStructure) {
            content += generateTableStructure(columns, tableName)
          }

          const values = data.map(row => 
            `(${columns
              .map(col => {
                const val = row[col]
                if (val === null || val === undefined) return 'NULL'
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
                if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
                if (typeof val === 'number') return val.toString()
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`
                return `'${String(val).replace(/'/g, "''")}'`
              })
              .join(', ')})`
          ).join(',\n')

          content += `-- Data for ${escapedTableName}\n`
          content += `INSERT INTO ${escapedTableName} (${escapedColumns.join(', ')})\n` +
                    `VALUES\n${values};\n`
          
          fileExtension = 'sql'
        }

        // Create and trigger download
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        
        try {
          link.href = url
          link.download = `${fileName}.${fileExtension}`
          link.style.display = 'none'
          
          document.body.appendChild(link)
          link.click()
          return true
        } finally {
          // Cleanup
          if (link.parentNode) {
            document.body.removeChild(link)
          }
          setTimeout(() => URL.revokeObjectURL(url), 100)
        }
      } catch (error) {
        console.error('Export failed:', error)
        return false
      }
    },
    []
  )

  return { exportData }
}