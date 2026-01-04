import React from 'react';

/**
 * Formats a cell value for consistent display in tables
 * @param value - The value to format
 * @returns Formatted React node representation of the value
 */
export function formatCellValue(value: unknown): React.ReactNode {
  // Handle null/undefined
  if (value == null) {
    return <span className="italic text-muted-foreground">NULL</span>;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return `[${value.map(v => 
      typeof v === 'object' ? JSON.stringify(v) : String(v)
    ).join(', ')}]`;
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle objects (non-array, non-date)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  // Handle strings
  if (typeof value === 'string') {
    return value || <span className="italic text-muted-foreground">(empty)</span>;
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Handle numbers, bigints, symbols, etc.
  return String(value);
}
