import type { ColumnDefinition, ForeignKeyDefinition } from '@/types/database'
import { TABLE_FORM_MESSAGES } from '@/constants/ui'
import { toast } from 'sonner'

export function validateTableForm(
  columns: ColumnDefinition[],
  foreignKeys: ForeignKeyDefinition[],
): {
  isValid: boolean
  validColumns: ColumnDefinition[]
  validForeignKeys: ForeignKeyDefinition[]
} {
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

// Extracted type compatibility logic for reuse
export function checkColumnTypeCompatibility(
  localType: string,
  referencedType: string,
): { compatible: boolean; warning: string } {
  // Ensure both types are strings, handle objects properly
  let localTypeStr = ''
  let referencedTypeStr = ''

  try {
    if (localType !== null && localType !== undefined) {
      if (typeof localType === 'object') {
        // If it's an object, try to get a meaningful string representation
        localTypeStr = JSON.stringify(localType)
      } else {
        localTypeStr = String(localType)
      }
    }

    if (referencedType !== null && referencedType !== undefined) {
      if (typeof referencedType === 'object') {
        // If it's an object, try to get a meaningful string representation
        referencedTypeStr = JSON.stringify(referencedType)
      } else {
        referencedTypeStr = String(referencedType)
      }
    }
  } catch (error) {
    // Fallback to empty string if conversion fails
    localTypeStr = ''
    referencedTypeStr = ''
  }

  // Convert both to uppercase for case-insensitive comparison
  const localTypeUpper = localTypeStr.toUpperCase()
  const referencedTypeUpper = referencedTypeStr.toUpperCase()

  const isCompatible =
    localTypeStr === referencedTypeStr ||
    (localTypeUpper.includes('INT') && referencedTypeUpper.includes('INT')) ||
    (localTypeUpper.includes('VARCHAR') &&
      referencedTypeUpper.includes('VARCHAR')) ||
    (localTypeUpper.includes('TEXT') && referencedTypeUpper.includes('TEXT')) ||
    (localTypeUpper.includes('CHAR') && referencedTypeUpper.includes('CHAR')) ||
    (localTypeUpper === 'UUID' && referencedTypeUpper === 'UUID') ||
    (localTypeUpper.includes('TIMESTAMP') &&
      referencedTypeUpper.includes('TIMESTAMP'))

  return {
    compatible: isCompatible,
    warning: isCompatible
      ? ''
      : `⚠️ Type mismatch: ${localTypeStr} → ${referencedTypeStr}`,
  }
}

export async function validateForeignKeyTypes(
  foreignKeys: ForeignKeyDefinition[],
  columns: ColumnDefinition[],
  schema: string,
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
          // Use the extracted compatibility function
          const { compatible } = checkColumnTypeCompatibility(
            localColumn.type,
            referencedColumn.data_type,
          )

          if (!compatible) {
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
