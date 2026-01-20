
export const API_URL = import.meta.env.SSR ? "http://app:8000"  : process.env.VITE_API_URL

export const DEFAULT_PAGE_SIZE_OPTIONS = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: Number.MAX_SAFE_INTEGER, label: 'No Limit' }
]

export const DEFAULT_EMPTY_MESSAGE = 'No data available'

export const DEFAULT_PAGE_SIZE = 50

export const DEFAULT_CURRENT_PAGE = 1

export const READONLY_SCHEMAS: readonly string[] = ['auth']

export const FilterOperators = {
  EQUALS: 'eq',
  NOT_EQUALS: 'neq',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL: 'lte',
  LIKE: 'like',
  ILIKE: 'ilike',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'not_null',
} as const

export type FilterOperator = typeof FilterOperators[keyof typeof FilterOperators]

export const FilterOperatorLabels: Record<FilterOperator, string> = {
  [FilterOperators.EQUALS]: '=',
  [FilterOperators.NOT_EQUALS]: '≠',
  [FilterOperators.GREATER_THAN]: '>',
  [FilterOperators.GREATER_THAN_OR_EQUAL]: '≥',
  [FilterOperators.LESS_THAN]: '<',
  [FilterOperators.LESS_THAN_OR_EQUAL]: '≤',
  [FilterOperators.LIKE]: 'contains',
  [FilterOperators.ILIKE]: 'contains (case-insensitive)',
  [FilterOperators.IS_NULL]: 'is null',
  [FilterOperators.IS_NOT_NULL]: 'is not null',
}

export const FilterOperatorTypes = {
  TEXT: [FilterOperators.EQUALS, FilterOperators.NOT_EQUALS, FilterOperators.LIKE, FilterOperators.ILIKE, FilterOperators.IS_NULL, FilterOperators.IS_NOT_NULL],
  NUMBER: [FilterOperators.EQUALS, FilterOperators.NOT_EQUALS, FilterOperators.GREATER_THAN, FilterOperators.GREATER_THAN_OR_EQUAL, FilterOperators.LESS_THAN, FilterOperators.LESS_THAN_OR_EQUAL, FilterOperators.IS_NULL, FilterOperators.IS_NOT_NULL],
  DATE: [FilterOperators.EQUALS, FilterOperators.NOT_EQUALS, FilterOperators.GREATER_THAN, FilterOperators.GREATER_THAN_OR_EQUAL, FilterOperators.LESS_THAN, FilterOperators.LESS_THAN_OR_EQUAL, FilterOperators.IS_NULL, FilterOperators.IS_NOT_NULL],
  BOOLEAN: [FilterOperators.EQUALS, FilterOperators.NOT_EQUALS, FilterOperators.IS_NULL, FilterOperators.IS_NOT_NULL],
} as const

export const DATA_TYPES = [
  // String Types
  { value: 'varchar', label: 'VARCHAR' },
  { value: 'char', label: 'CHAR' },
  { value: 'text', label: 'TEXT' },
  
  // Numeric Types
  { value: 'smallint', label: 'SMALLINT' },
  { value: 'integer', label: 'INTEGER' },
  { value: 'bigint', label: 'BIGINT' },
  { value: 'decimal', label: 'DECIMAL' },
  { value: 'numeric', label: 'NUMERIC' },
  { value: 'real', label: 'REAL' },
  { value: 'double precision', label: 'DOUBLE PRECISION' },
  { value: 'serial', label: 'SERIAL' },
  { value: 'bigserial', label: 'BIGSERIAL' },
  
  // Boolean
  { value: 'boolean', label: 'BOOLEAN' },
  
  // Date/Time Types
  { value: 'date', label: 'DATE' },
  { value: 'time', label: 'TIME' },
  { value: 'timetz', label: 'TIME WITH TIME ZONE' },
  { value: 'timestamp', label: 'TIMESTAMP' },
  { value: 'timestamptz', label: 'TIMESTAMP WITH TIME ZONE' },
  { value: 'interval', label: 'INTERVAL' },
  
  // Network Address Types
  { value: 'inet', label: 'INET' },
  { value: 'cidr', label: 'CIDR' },
  { value: 'macaddr', label: 'MACADDR' },
  
  // JSON Types
  { value: 'json', label: 'JSON' },
  { value: 'jsonb', label: 'JSONB' },
  
  // Binary Data
  { value: 'bytea', label: 'BYTEA' },
  
  // UUID
  { value: 'uuid', label: 'UUID' },
  
  // Special Types
  { value: 'money', label: 'MONEY' },
  { value: 'tsvector', label: 'TSVECTOR' },
  { value: 'tsquery', label: 'TSQUERY' },
  { value: 'xml', label: 'XML' },
  
  // Geometric Types
  { value: 'point', label: 'POINT' },
  { value: 'line', label: 'LINE' },
  { value: 'lseg', label: 'LSEG' },
  { value: 'box', label: 'BOX' },
  { value: 'path', label: 'PATH' },
  { value: 'polygon', label: 'POLYGON' },
  { value: 'circle', label: 'CIRCLE' }
] as const

export const DEFAULT_COLUMN = {
  name: '',
  type: 'text',
  nullable: true,
  isPrimaryKey: false,
  unique: false,
  defaultValue: undefined,
} as const

export const DEFAULT_FOREIGN_KEY = {
  column: '',
  referencedTable: '',
  referencedColumn: '',
  onDelete: 'NO ACTION' as const,
  onUpdate: 'NO ACTION' as const,
} as const

export const FOREIGN_KEY_ACTIONS = [
  { value: 'NO ACTION' as const, label: 'No Action' },
  { value: 'RESTRICT' as const, label: 'Restrict' },
  { value: 'CASCADE' as const, label: 'Cascade' },
  { value: 'SET NULL' as const, label: 'Set Null' },
  { value: 'SET DEFAULT' as const, label: 'Set Default' },
] as const

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  SQL: 'sql',
} as const

export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS]

// Common button text labels
export const BUTTON_LABELS = {
  COPY: 'Copy',
  EXPORT: 'Export',
  INSERT: 'Insert',
  EDIT: 'Edit',
  DELETE: 'Delete',
  CANCEL: 'Cancel',
  CREATE_TABLE: 'Create Table',
  CREATE_SCHEMA: 'Create Schema',
  ADD_SORT: 'Add Sort',
  ADD_FILTER: 'Add Filter',
  APPLY_SORTING: 'Apply Sorting',
  APPLY_FILTERS: 'Apply Filters',
  CLEAR_ALL: 'Clear All',
} as const

// Common dropdown menu item labels
export const DROPDOWN_LABELS = {
  COPY_AS_JSON: 'Copy as JSON',
  COPY_AS_CSV: 'Copy as CSV',
  COPY_AS_SQL: 'Copy as SQL',
  EXPORT_AS_JSON: 'Export as JSON',
  EXPORT_AS_CSV: 'Export as CSV',
  EXPORT_AS_SQL: 'Export as SQL',
} as const

// Common placeholder texts
export const PLACEHOLDERS = {
  SQL_QUERY: 'Enter your SQL query here...',
  SEARCH_TABLES: 'Search tables & views...',
  SEARCH_TABLE: 'Search for a table',
  SEARCH_COLUMN: 'Search for a column',
  SEARCH_TRIGGERS: 'Search triggers...',
  SEARCH_FUNCTIONS: 'Search functions...',
  SEARCH_INDEXES: 'Search for an index',
  SEARCH_ENUMS: 'Search for an enum type',
  TABLE_NAME: 'users, products, orders',
  OPTIONAL: 'Optional',
  COLUMN_NAME: 'e.g., name',
  SCHEMA_NAME: 'Enter schema name',
  FILTER_VALUE: 'Value',
  SELECT_SCHEMA: 'Select a schema',
  SELECT_COLUMN: 'Column',
  SELECT_OPERATOR: 'Operator',
  TABLE_NAME_FK: 'Table name',
  COLUMN_NAME_FK: 'Column name',
} as const

// Common title texts
export const TITLES = {
  TOGGLE_SIDEBAR: 'Toggle Sidebar',
  CHANGE_THEME: 'Change Theme',
  MODIFIED: 'Modified',
  NEW_QUERY_TAB: 'New Query Tab',
  SELECT_COLUMN_SORT: 'Select column',
  MORE: 'More',
  CLOSE: 'Close',
  PREVIOUS_SLIDE: 'Previous slide',
  NEXT_SLIDE: 'Next slide',
  MORE_PAGES: 'More pages',
  GO_TO_FIRST_PAGE: 'Go to first page',
  GO_TO_PREVIOUS_PAGE: 'Go to previous page',
  GO_TO_NEXT_PAGE: 'Go to next page',
  GO_TO_LAST_PAGE: 'Go to last page',
  TOGGLE_THEME: 'Toggle theme',
  DELETE_TABLE: 'Delete Table',
  TRUNCATE_TABLE: 'Truncate Table',
  AN_ERROR_OCCURRED: 'An Error Occurred',
  PAGE_NOT_FOUND: 'Oops! Page Not Found',
} as const

// Common description texts
export const DESCRIPTIONS = {
  ERROR_OCCURRED: 'Something went wrong while processing your request.',
  PAGE_NOT_FOUND: 'The page you\'re looking for doesn\'t exist or has been moved.',
  SCHEMA_NAME_RULES: 'Schema name must start with a letter or underscore and contain only letters, numbers, or underscores',
} as const

// Screen reader labels
export const SCREEN_READER_LABELS = {
  TOGGLE_SIDEBAR: 'Toggle Sidebar',
  CLOSE: 'Close',
  MORE: 'More',
  TOGGLE_THEME: 'Toggle theme',
} as const
