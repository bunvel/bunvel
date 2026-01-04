import React from 'react';

/**
 * Formats a cell value for consistent display in tables
 * @param value - The value to format
 * @returns Formatted React node representation of the value
 */
export function formatCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return React.createElement('span', { className: 'italic text-muted-foreground' }, 'NULL');
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `[${value.map(v => {
        const formatted = formatCellValue(v);
        return typeof formatted === 'string' ? formatted : JSON.stringify(formatted);
      }).join(', ')}]`;
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'string') {
    return value || React.createElement('span', { className: 'italic text-muted-foreground' }, '(empty)');
  }
  
  return String(value);
}
