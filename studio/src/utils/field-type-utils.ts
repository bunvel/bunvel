// Field type detection utilities
export const isNumericType = (fieldType: string): boolean => {
  return (
    fieldType.includes('int') ||
    fieldType.includes('numeric') ||
    fieldType.includes('decimal') ||
    fieldType.includes('real') ||
    fieldType.includes('double') ||
    fieldType.includes('serial')
  )
}

export const isDateType = (fieldType: string): boolean => {
  return fieldType.includes('date') || fieldType.includes('time')
}

export const isTextType = (fieldType: string): boolean => {
  return (
    fieldType.includes('text') ||
    fieldType.includes('varchar') ||
    fieldType.includes('char')
  )
}

export const isJsonType = (fieldType: string): boolean => {
  return fieldType.includes('json')
}

export const isCustomEnum = (
  dataType: string,
  enumValuesMap: Record<string, string[]>
): boolean => {
  return Object.keys(enumValuesMap).includes(dataType)
}

// Array handling utilities
export const formatArrayValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return `[${value.join(', ')}]`
  return value.toString()
}

export const parseArrayInput = (input: string, fieldType: string): any[] => {
  let items: string[] = []

  // Check if value is in bracketed format [item1, item2, item3]
  if (input.trim().startsWith('[') && input.trim().endsWith(']')) {
    const bracketContent = input.trim().slice(1, -1).trim()
    if (bracketContent) {
      items = bracketContent.split(',').map((item) => item.trim())
    }
  } else {
    // Fallback to newline-separated values
    items = input.split('\n').map((item) => item.trim())
  }

  return items
    .filter((item) => item !== '') // Remove empty entries
    .map((item) => {
      // Check if this should be a number (for integer[], numeric[], etc.)
      if (
        fieldType.includes('int') ||
        fieldType.includes('numeric') ||
        fieldType.includes('decimal')
      ) {
        const num = parseInt(item, 10)
        return isNaN(num) ? item : num
      }
      return item
    })
}

// Constants
export const GRID_LAYOUT_CLASS = 'grid grid-cols-[200px_1fr] gap-4 items-start'
export const TEXTAREA_ROWS_TEXT = 4
export const TEXTAREA_ROWS_JSON = 6
