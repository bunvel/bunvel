import { TableMetadata } from '@/services/editor.service'
import React from 'react'

// Constants
const MAX_ARRAY_ITEMS = 10
const EMPTY_STRING_PLACEHOLDER = '(empty)'
const NULL_PLACEHOLDER = 'NULL'

// Type definitions
interface ColumnMetadata {
  column_name: string
  data_type: string
  is_primary_key: boolean
  is_foreign_key: boolean
}

// Memoized type mappings
const TYPE_MAPPINGS = {
  'timestamp with time zone': 'timestamptz',
  'timestamp without time zone': 'timestamp',
  'time with time zone': 'timetz',
  'time without time zone': 'time',
  'double precision': 'float8',
  'character varying': 'varchar',
  'character': 'char',
  'boolean': 'bool',
  'integer': 'int',
  'serial': 'serial4',
  'bigserial': 'serial8',
  'decimal': 'numeric',
} as const

/**
 * Normalizes and formats database data types to be more user-friendly and concise
 * @param dataType - The raw database data type
 * @returns Formatted, more readable data type
 */
export function formatDataType(dataType: string = ''): string {
  const type = dataType.toLowerCase().trim()
  if (!type) return type
  
  // Handle array types (e.g., integer[], text[])
  if (type.endsWith('[]')) {
    const baseType = type.slice(0, -2)
    return `${formatDataType(baseType)}[]`
  }
  
  // Handle length-specified types (e.g., varchar(255))
  const lengthMatch = type.match(/^([a-z\s]+)(\(\d+\))$/i)
  if (lengthMatch) {
    const [, baseType, length] = lengthMatch
    return `${formatDataType(baseType.trim())}${length}`
  }
  
  // Return mapped type or original if no mapping exists
  return TYPE_MAPPINGS[type as keyof typeof TYPE_MAPPINGS] || type
}

/**
 * Formats a cell value for consistent display in tables
 * @param value - The value to format
 * @returns Formatted React node representation of the value
 */
export function formatCellValue(value: unknown): React.ReactNode {
  
  // Handle null/undefined
  if (value == null) {
    return <span className="italic text-muted-foreground">{NULL_PLACEHOLDER}</span>
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return formatArrayValue(value)
  }

  // Handle objects (non-array, non-date)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  // Handle strings
  if (typeof value === 'string') {
    return value || <span className="italic text-muted-foreground">{EMPTY_STRING_PLACEHOLDER}</span>
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  // Handle numbers, bigints, symbols, etc.
  return String(value)
}

/**
 * Formats array values with a maximum item limit
 */
function formatArrayValue(value: unknown[]): string {
  const items = value.slice(0, MAX_ARRAY_ITEMS)
  const overflowCount = Math.max(0, value.length - MAX_ARRAY_ITEMS)
  const suffix = overflowCount > 0 ? `, ... +${overflowCount} more` : ''

  const formattedItems = items.map(item => 
    typeof item === 'object' ? JSON.stringify(item) : String(item)
  )

  return `[${formattedItems.join(', ')}${suffix}]`
}

/**
 * Sorts and groups columns by their type (primary keys, foreign keys, others)
 * @param cols - Array of column metadata
 * @returns Sorted and grouped array of columns
 */
export function getSortedColumns(cols: TableMetadata['columns']): ColumnMetadata[] {
  if (!cols?.length) return []
  
  const sortedCols = [...cols].sort((a, b) => 
    a.column_name.localeCompare(b.column_name)
  )
  
  return [
    ...sortedCols.filter(col => col.is_primary_key),
    ...sortedCols.filter(col => !col.is_primary_key && col.is_foreign_key),
    ...sortedCols.filter(col => !col.is_primary_key && !col.is_foreign_key)
  ]
}