import { FilterConfig } from '@/types/table'
import { FilterSqlOperators } from '@/constants/filter'

/**
 * Validates a filter configuration based on operator requirements
 * @param filter - The filter configuration to validate
 * @returns boolean indicating if the filter is valid
 */
export const isFilterValid = (filter: FilterConfig): boolean => {
  const operatorConfig = FilterSqlOperators[filter.operator]
  if (!operatorConfig.requiresParameter) {
    return true // IS NULL, IS NOT NULL don't need values
  }
  // Other operators must have non-empty values
  return (
    filter.value !== null && filter.value !== '' && filter.value !== undefined
  )
}

/**
 * Generates a unique filter ID based on column and timestamp
 * @param filter - The filter configuration
 * @returns Unique string ID for the filter
 */
export const generateFilterId = (filter: FilterConfig): string =>
  `${filter.column}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/**
 * Processes filters by validating them and adding unique IDs
 * @param filters - Array of filter configurations
 * @returns Array of validated filters with unique IDs
 */
export const processFiltersWithIds = (
  filters: FilterConfig[],
): FilterConfig[] =>
  filters.filter(isFilterValid).map((f) => ({ ...f, id: generateFilterId(f) }))

/**
 * Checks if two arrays of filters are equal (ignoring order)
 * @param filters1 - First array of filters
 * @param filters2 - Second array of filters
 * @returns boolean indicating if filters are equal
 */
export const areFiltersEqual = (
  filters1: FilterConfig[],
  filters2: FilterConfig[],
): boolean => {
  return JSON.stringify(filters1.sort()) === JSON.stringify(filters2.sort())
}

/**
 * Creates a new filter configuration with default values
 * @param column - Column name for the filter
 * @param operator - Filter operator (defaults to '=')
 * @param value - Filter value (defaults to null)
 * @returns New filter configuration with unique ID
 */
export const createFilter = (
  column: string,
  operator: string = '=',
  value: string | number | boolean | null = null,
): FilterConfig => {
  const filter: Omit<FilterConfig, 'id'> = {
    column,
    operator: operator as any, // Type assertion since we don't have strict operator typing here
    value,
  }
  return {
    ...filter,
    id: generateFilterId({ ...filter, id: '' }), // Temporary ID for generation
  }
}

/**
 * Removes filters that reference a specific column
 * @param filters - Array of filters
 * @param column - Column name to remove filters for
 * @returns Array of filters without the specified column
 */
export const removeFiltersByColumn = (
  filters: FilterConfig[],
  column: string,
): FilterConfig[] => filters.filter((filter) => filter.column !== column)

/**
 * Gets available columns that don't have filters applied
 * @param allColumns - All available columns
 * @param appliedFilters - Currently applied filters
 * @returns Array of available column names
 */
export const getAvailableColumns = (
  allColumns: Array<{ column_name: string }>,
  appliedFilters: FilterConfig[],
): string[] => {
  const usedColumns = new Set(appliedFilters.map((filter) => filter.column))
  return allColumns
    .map((col) => col.column_name)
    .filter((columnName) => !usedColumns.has(columnName))
}
