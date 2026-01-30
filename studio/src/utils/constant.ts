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

export const READONLY_SCHEMAS: readonly string[] = ['auth']

export const FilterOperators = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  LIKE: 'LIKE',
  ILIKE: 'ILIKE',
  IS_NULL: 'IS NULL',
  IS_NOT_NULL: 'IS NOT NULL',
} as const

export type FilterOperator =
  (typeof FilterOperators)[keyof typeof FilterOperators]

export const FilterOperatorLabels: Record<FilterOperator, string> = {
  [FilterOperators.EQUALS]: '= (equals)',
  [FilterOperators.NOT_EQUALS]: '≠ (not equals)',
  [FilterOperators.GREATER_THAN]: '> (greater than)',
  [FilterOperators.GREATER_THAN_OR_EQUAL]: '≥ (greater than or equal)',
  [FilterOperators.LESS_THAN]: '< (less than)',
  [FilterOperators.LESS_THAN_OR_EQUAL]: '≤ (less than or equal)',
  [FilterOperators.LIKE]: 'contains',
  [FilterOperators.ILIKE]: 'contains (case-insensitive)',
  [FilterOperators.IS_NULL]: 'is null',
  [FilterOperators.IS_NOT_NULL]: 'is not null',
}

export const FilterOperatorTypes = {
  TEXT: ['=', '!=', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL'],
  NUMBER: ['=', '!=', '>', '>=', '<', '<=', 'IS NULL', 'IS NOT NULL'],
  DATE: ['=', '!=', '>', '>=', '<', '<=', 'IS NULL', 'IS NOT NULL'],
  BOOLEAN: ['=', '!=', 'IS NULL', 'IS NOT NULL'],
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
  { value: 'circle', label: 'CIRCLE' },
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

export type ExportFormat = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS]

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
  JSON_VIEW: 'JSON View',
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
  PAGE_NOT_FOUND:
    "The page you're looking for doesn't exist or has been moved.",
  SCHEMA_NAME_RULES:
    'Schema name must start with a letter or underscore and contain only letters, numbers, or underscores',
} as const

// Screen reader labels
export const SCREEN_READER_LABELS = {
  TOGGLE_SIDEBAR: TITLES.TOGGLE_SIDEBAR,
  CLOSE: TITLES.CLOSE,
  MORE: TITLES.MORE,
  TOGGLE_THEME: TITLES.TOGGLE_THEME,
} as const

// Table form specific messages
export const TABLE_FORM_MESSAGES = {
  // Titles and labels
  CREATE_NEW_TABLE: 'Create New Table',
  TABLE_NAME: 'Table Name',
  DESCRIPTION: 'Description',
  TABLE_COLUMNS: 'Table Columns',
  FOREIGN_KEYS: 'Foreign Keys',
  COLUMN_NAME: 'Column Name',
  DATA_TYPE: 'Data Type',
  DEFAULT: 'Default',
  REFERENCED_TABLE: 'Referenced Table',
  REFERENCED_COLUMN: 'Referenced Column',
  ON_DELETE: 'On Delete',
  ON_UPDATE: 'On Update',

  // Descriptions
  DEFINE_TABLE_STRUCTURE: 'Define your table structure by adding columns',
  DEFINE_FOREIGN_KEYS: 'Define your foreign key relationships',

  // Button labels
  ADD_COLUMN: 'Add Column',
  ADD_FOREIGN_KEY: 'Add Foreign Key',
  CREATE_TABLE: 'Create Table',
  CANCEL: 'Cancel',
  CREATING: 'Creating...',
  REMOVE: 'Remove',

  // Placeholders
  SELECT_TABLE_FIRST: 'Select table first',
  SELECT_COLUMN: 'Select column',
  SELECT_REFERENCED_TABLE: 'Select referenced table',
  SELECT_REFERENCED_COLUMN: 'Select referenced column',

  // Error messages
  FOREIGN_KEY_TYPE_MISMATCH: 'Foreign key type mismatch',
  TYPE_MISMATCH_TEMPLATE: `Column "{column}" ({localType}) and referenced column "{referencedColumn}" ({referencedType}) have incompatible types.`,

  // Checkbox labels
  PRIMARY_KEY: 'Primary Key',
  UNIQUE: 'Unique',
  NULLABLE: 'Nullable',
} as const

// SQL operator mappings for filter operations
export const FilterSqlOperators: Record<
  FilterOperator,
  {
    template: string
    valueFormatter?: (value: any) => any
    requiresParameter: boolean
  }
> = {
  '=': { template: '= $%d', requiresParameter: true },
  '!=': { template: '!= $%d', requiresParameter: true },
  '>': { template: '> $%d', requiresParameter: true },
  '>=': { template: '>= $%d', requiresParameter: true },
  '<': { template: '< $%d', requiresParameter: true },
  '<=': { template: '<= $%d', requiresParameter: true },
  LIKE: {
    template: 'LIKE $%d',
    valueFormatter: (value) => `%${String(value)}%`,
    requiresParameter: true,
  },
  ILIKE: {
    template: 'ILIKE $%d',
    valueFormatter: (value) => `%${String(value)}%`,
    requiresParameter: true,
  },
  'IS NULL': { template: 'IS NULL', requiresParameter: false },
  'IS NOT NULL': { template: 'IS NOT NULL', requiresParameter: false },
} as const
