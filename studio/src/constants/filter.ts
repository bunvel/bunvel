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
