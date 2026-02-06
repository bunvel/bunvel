import type { ForeignKeyAction } from '@/types/database'

export const DATA_TYPES = [
  // String Types
  'VARCHAR',
  'CHAR',
  'TEXT',

  // Numeric Types
  'SMALLINT',
  'INTEGER',
  'BIGINT',
  'DECIMAL',
  'NUMERIC',
  'REAL',
  'DOUBLE PRECISION',
  'SERIAL',
  'BIGSERIAL',

  // Boolean
  'BOOLEAN',

  // Date/Time Types
  'DATE',
  'TIME',
  'TIME WITH TIME ZONE',
  'TIMESTAMP',
  'TIMESTAMP WITH TIME ZONE',
  'INTERVAL',

  // Network Address Types
  'INET',
  'CIDR',
  'MACADDR',

  // JSON Types
  'JSON',
  'JSONB',

  // Binary Data
  'BYTEA',

  // UUID
  'UUID',

  // Special Types
  'MONEY',
  'TSVECTOR',
  'TSQUERY',
  'XML',

  // Geometric Types
  'POINT',
  'LINE',
  'LSEG',
  'BOX',
  'PATH',
  'POLYGON',
  'CIRCLE',
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
  schema: 'public' as const,
} as const

export const FOREIGN_KEY_ACTIONS: Array<ForeignKeyAction> = [
  'NO ACTION',
  'RESTRICT',
  'CASCADE',
]
