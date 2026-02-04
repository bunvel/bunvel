import { toast } from 'sonner'
import type { ColumnDefinition, ForeignKeyDefinition } from '@/types/database'
import { TABLE_FORM_MESSAGES } from '@/utils/constant'

export function validateTableForm(
  columns: ColumnDefinition[],
  foreignKeys: ForeignKeyDefinition[]
): { isValid: boolean; validColumns: ColumnDefinition[]; validForeignKeys: ForeignKeyDefinition[] } {
  // Filter out empty column names and validate
  const validColumns = columns.filter((col) => col.name.trim() !== '')
  if (validColumns.length === 0) {
    toast.error('At least one column is required')
    return { isValid: false, validColumns: [], validForeignKeys: [] }
  }

  // Validate column names
  const columnNames = validColumns.map((col) => col.name.toLowerCase())
  if (new Set(columnNames).size !== columnNames.length) {
    toast.error('Column names must be unique')
    return { isValid: false, validColumns: [], validForeignKeys: [] }
  }

  // Filter out incomplete foreign keys
  const validForeignKeys = foreignKeys.filter(
    (fk) => fk.column && fk.referencedTable && fk.referencedColumn,
  )

  return { isValid: true, validColumns, validForeignKeys }
}

export async function validateForeignKeyTypes(
  foreignKeys: ForeignKeyDefinition[],
  columns: ColumnDefinition[],
  schema: string
): Promise<boolean> {
  const validForeignKeys = foreignKeys.filter(
    (fk) => fk.column && fk.referencedTable && fk.referencedColumn,
  )

  if (validForeignKeys.length === 0) return true

  for (const fk of validForeignKeys) {
    // Find the local column
    const localColumn = columns.find((col) => col.name === fk.column)
    if (!localColumn) continue

    try {
      // Use the editor service to get table metadata
      const { getTableMetadata } = await import('@/services/editor.service')
      const result = await getTableMetadata({
        data: { schema, table: fk.referencedTable },
      })
      const metadata = result?.data

      if (metadata) {
        const referencedColumn = metadata.columns?.find(
          (col: any) => col.column_name === fk.referencedColumn,
        )

        if (referencedColumn) {
          // Check if types are compatible
          const localType = localColumn.type.toLowerCase()
          const refType = referencedColumn.data_type.toLowerCase()

          // Basic type compatibility check
          const isCompatible =
            localType === refType ||
            (localType.includes('int') && refType.includes('int')) ||
            (localType.includes('varchar') && refType.includes('varchar')) ||
            (localType.includes('text') && refType.includes('text')) ||
            (localType.includes('char') && refType.includes('char')) ||
            (localType === 'uuid' && refType === 'uuid') ||
            (localType.includes('timestamp') && refType.includes('timestamp'))

          if (!isCompatible) {
            toast.error(TABLE_FORM_MESSAGES.FOREIGN_KEY_TYPE_MISMATCH, {
              description: TABLE_FORM_MESSAGES.TYPE_MISMATCH_TEMPLATE.replace(
                '{column}',
                fk.column,
              )
                .replace('{localType}', localColumn.type)
                .replace('{referencedColumn}', fk.referencedColumn)
                .replace('{referencedType}', referencedColumn.data_type),
            })
            return false
          }
        }
      }
    } catch (error) {
      // If we can't validate types, let the backend handle it
      const { logger } = await import('@/lib/logger')
      logger
        .component('table-form-validation')
        .warn('Could not validate foreign key types', error)
    }
  }

  return true
}
