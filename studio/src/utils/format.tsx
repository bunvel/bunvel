import {
  Tooltip,
  TooltipContent, TooltipTrigger
} from '@/components/ui/tooltip'
import { format } from 'date-fns'
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
    character: 'char',
    boolean: 'bool',
    integer: 'int',
    serial: 'serial4',
    bigserial: 'serial8',
    decimal: 'numeric',
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
 * @param dataType - The optional database data type
 * @returns Formatted React node representation of the value
 */
export function formatCellValue(
  value: unknown,
  dataType?: string,
): React.ReactNode {
  // Handle null/undefined
  if (value == null) {
    return <span className="italic text-muted-foreground text-xs">NULL</span>
  }

  const type = dataType?.toLowerCase() || ''

  // Handle booleans
  if (typeof value === 'boolean' || type === 'boolean') {
    const boolVal =
      typeof value === 'boolean'
        ? value
        : String(value).toLowerCase() === 'true'
    return boolVal ? 'TRUE' : 'FALSE'
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const MAX_ARRAY_ITEMS = 10
    const items = value.slice(0, MAX_ARRAY_ITEMS)
    const suffix =
      value.length > MAX_ARRAY_ITEMS
        ? `, ... +${value.length - MAX_ARRAY_ITEMS} more`
        : ''
    const preview = `[${items
      .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
      .join(', ')}${suffix}]`

    return (
      <Tooltip>
        <TooltipTrigger
          render={<span className="font-mono text-xs max-w-[250px] truncate block cursor-default text-left" />}
        >
          {preview}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-xl max-h-[400px] overflow-auto whitespace-pre font-mono text-xs z-[100]"
        >
          {JSON.stringify(value, null, 2)}
        </TooltipContent>
      </Tooltip>
    )
  }

  // Handle dates or timestamp fields
  if (
    value instanceof Date ||
    type.includes('timestamp') ||
    type === 'date' ||
    type.includes('time')
  ) {
    try {
      const dateVal = value instanceof Date ? value : new Date(String(value))
      if (!isNaN(dateVal.getTime())) {
        return (
          <span className="font-mono text-xs" title={dateVal.toISOString()}>
            {format(dateVal, 'yyyy-MM-dd HH:mm:ss')}
          </span>
        )
      }
    } catch {
      // Fallback if Date parsing fails
    }
  }

  // Handle JSON and objects
  if (typeof value === 'object' || type === 'json' || type === 'jsonb') {
    try {
      const strVal = typeof value === 'string' ? value : JSON.stringify(value)

      if (strVal === '{}' || strVal === '[]') {
        return <span className="italic text-muted-foreground text-xs">NULL</span>
      }

      return (
        <Tooltip>
          <TooltipTrigger
            render={<span className="font-mono text-xs max-w-[200px] truncate block cursor-default text-left" />}
          >
            {strVal}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            className="max-w-xl max-h-[400px] overflow-auto whitespace-pre font-mono text-xs z-[100]"
          >
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </TooltipContent>
        </Tooltip>
      )
    } catch {
      return String(value)
    }
  }

  // Handle strings
  if (typeof value === 'string') {
    if (!value) {
      return (
        <span className="italic text-muted-foreground text-xs">(empty)</span>
      )
    }

    // Check if the string is a valid image URL
    const IMAGE_URL_REGEX = /\.(png|jpe?g|gif|webp|svg|bmp)(?:\?.*)?$/i
    const isImageUrl =
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('/')

    if (isImageUrl && IMAGE_URL_REGEX.test(value)) {
      return (
        <div className="flex items-center gap-2">
          <img
            src={value}
            alt="Preview"
            className="size-6 object-cover rounded border bg-muted shadow-sm transition-transform hover:scale-150 duration-200"
            onError={(e) => {
              // Hide image preview on failure and just leave the URL text
              e.currentTarget.style.display = 'none'
            }}
          />
          <span
            className="truncate max-w-[150px] font-mono text-xs"
            title={value}
          >
            {value}
          </span>
        </div>
      )
    }

    return (
      <span className="truncate block max-w-[300px]" title={value}>
        {value}
      </span>
    )
  }

  // Handle numbers, bigints, symbols, etc.
  return <span className="font-mono text-xs">{String(value)}</span>
}
