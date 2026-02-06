export const API_URL = import.meta.env.SSR
  ? 'http://app:8000'
  : process.env.VITE_API_URL

export const DEFAULT_PAGE_SIZE_OPTIONS = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: Number.MAX_SAFE_INTEGER, label: 'No Limit' },
]

export const MAX_TABLE_TABS = 5

export const DEFAULT_EMPTY_MESSAGE = 'No data available'

export const DEFAULT_PAGE_SIZE = 50

export const DEFAULT_CURRENT_PAGE = 1

export const READONLY_SCHEMAS: ReadonlyArray<string> = ['auth']

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  SQL: 'sql',
} as const

export type ExportFormat = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS]
