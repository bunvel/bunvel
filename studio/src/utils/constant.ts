
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
