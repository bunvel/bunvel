import React from 'react'

/**
 * Formats database data types to be more user-friendly and concise
 * @param dataType - The raw database data type
 * @returns Formatted, more readable data type
 */
export function formatDataType(dataType: string): string {
  if (!dataType) return dataType
  
  const type = dataType.toLowerCase().trim()
  
  // Common type mappings
  const typeMap: Record<string, string> = {
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
  }
  
  // Check for array types (e.g., integer[], text[])
  if (type.endsWith('[]')) {
    const baseType = type.slice(0, -2)
    return `${formatDataType(baseType)}[]`
  }
  
  // Check for length-specified types (e.g., varchar(255))
  const lengthMatch = type.match(/^([a-z\s]+)\(\d+\)$/i)
  if (lengthMatch) {
    const baseType = lengthMatch[1].trim()
    const length = type.match(/\(\d+\)/)?.[0] || ''
    return `${formatDataType(baseType)}${length}`
  }
  
  // Return mapped type or original if no mapping exists
  return typeMap[type] || type
}

/**
 * Formats a cell value for consistent display in tables
 * @param value - The value to format
 * @returns Formatted React node representation of the value
 */
export function formatCellValue(value: unknown): React.ReactNode {
  // Handle null/undefined
  if (value == null) {
    return <span className="italic text-muted-foreground">NULL</span>
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const MAX_ARRAY_ITEMS = 10
    const items = value.slice(0, MAX_ARRAY_ITEMS)
    const suffix =
      value.length > MAX_ARRAY_ITEMS
        ? `, ... +${value.length - MAX_ARRAY_ITEMS} more`
        : ''

    return `[${items
      .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
      .join(', ')}${suffix}]`
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString()
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
    return (
      value || <span className="italic text-muted-foreground">(empty)</span>
    )
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  // Handle numbers, bigints, symbols, etc.
  return String(value)
}
