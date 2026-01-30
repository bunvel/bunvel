import { languages } from 'monaco-editor'

export interface SqlCompletionItem {
  label: string
  kind: languages.CompletionItemKind
  insertText: string
  documentation?: string
  range?: any
  sortText?: string
  filterText?: string
}

// Define completion kinds for better readability
const KIND = {
  KEYWORD: languages.CompletionItemKind.Keyword,
  CLASS: languages.CompletionItemKind.Class,
  FUNCTION: languages.CompletionItemKind.Function,
}

// Helper function to create completion items
const createCompletion = (
  label: string,
  kind: languages.CompletionItemKind,
  insertText?: string,
) => ({
  label,
  kind,
  insertText: insertText || `${label}${kind === KIND.KEYWORD ? ' ' : ''}`,
  filterText: label.toLowerCase(),
  sortText: label,
})

// SQL keywords grouped by category
const SQL_KEYWORDS = {
  basic: [
    'SELECT',
    'FROM',
    'WHERE',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'DROP',
    'ALTER',
  ],
  joins: [
    'JOIN',
    'INNER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'FULL JOIN',
    'CROSS JOIN',
  ],
  clauses: ['GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET'],
  conditions: [
    'AND',
    'OR',
    'NOT',
    'IN',
    'EXISTS',
    'BETWEEN',
    'LIKE',
    'ILIKE',
    'IS',
  ],
  values: ['NULL', 'TRUE', 'FALSE'],
  setOperations: ['UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'],
  tableOperations: [
    'TABLE',
    'INDEX',
    'VIEW',
    'MATERIALIZED VIEW',
    'SEQUENCE',
    'SCHEMA',
    'DATABASE',
    'TABLESPACE',
  ],
  constraints: [
    'PRIMARY KEY',
    'FOREIGN KEY',
    'REFERENCES',
    'UNIQUE',
    'CHECK',
    'DEFAULT',
  ],
  modifiers: [
    'NOT NULL',
    'AUTO_INCREMENT',
    'SERIAL',
    'IDENTITY',
    'GENERATED',
    'AS',
    'ON',
    'WITH',
  ],
  transaction: ['BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'RELEASE'],
}

// PostgreSQL data types
const POSTGRESQL_TYPES = [
  'VARCHAR',
  'TEXT',
  'INTEGER',
  'BIGINT',
  'SMALLINT',
  'DECIMAL',
  'NUMERIC',
  'REAL',
  'DOUBLE PRECISION',
  'BOOLEAN',
  'TIMESTAMP',
  'DATE',
  'TIME',
  'JSON',
  'JSONB',
  'UUID',
  'INET',
  'CIDR',
  'MACADDR',
  'POINT',
  'LINE',
  'POLYGON',
]

// Function definitions with their signatures
const SQL_FUNCTIONS = {
  aggregate: [
    { name: 'COUNT', signature: 'COUNT($1)' },
    { name: 'SUM', signature: 'SUM($1)' },
    { name: 'AVG', signature: 'AVG($1)' },
    { name: 'MAX', signature: 'MAX($1)' },
    { name: 'MIN', signature: 'MIN($1)' },
    { name: 'STDDEV', signature: 'STDDEV($1)' },
    { name: 'VARIANCE', signature: 'VARIANCE($1)' },
  ],
  dateTime: [
    { name: 'NOW', signature: 'NOW()' },
    { name: 'CURRENT_TIMESTAMP', signature: 'CURRENT_TIMESTAMP' },
    { name: 'CURRENT_DATE', signature: 'CURRENT_DATE' },
    { name: 'CURRENT_TIME', signature: 'CURRENT_TIME' },
    { name: 'EXTRACT', signature: 'EXTRACT($1 FROM $2)' },
  ],
  string: [
    { name: 'UPPER', signature: 'UPPER($1)' },
    { name: 'LOWER', signature: 'LOWER($1)' },
    { name: 'LENGTH', signature: 'LENGTH($1)' },
    { name: 'TRIM', signature: 'TRIM($1)' },
    { name: 'SUBSTRING', signature: 'SUBSTRING($1 FROM $2 FOR $3)' },
    { name: 'CONCAT', signature: 'CONCAT($1, $2)' },
    { name: 'REPLACE', signature: 'REPLACE($1, $2, $3)' },
  ],
  postgresql: [
    { name: 'gen_random_uuid', signature: 'gen_random_uuid()' },
    { name: 'array_agg', signature: 'array_agg($1)' },
    { name: 'string_agg', signature: 'string_agg($1, $2)' },
    { name: 'json_agg', signature: 'json_agg($1)' },
    { name: 'jsonb_agg', signature: 'jsonb_agg($1)' },
  ],
  window: [
    { name: 'ROW_NUMBER', signature: 'ROW_NUMBER() OVER ($1)' },
    { name: 'RANK', signature: 'RANK() OVER ($1)' },
    { name: 'DENSE_RANK', signature: 'DENSE_RANK() OVER ($1)' },
    { name: 'LAG', signature: 'LAG($1, $2, $3) OVER ($4)' },
    { name: 'LEAD', signature: 'LEAD($1, $2, $3) OVER ($4)' },
    { name: 'FIRST_VALUE', signature: 'FIRST_VALUE($1) OVER ($2)' },
    { name: 'LAST_VALUE', signature: 'LAST_VALUE($1) OVER ($2)' },
  ],
}

// Generate completion items from arrays
const generateCompletions = (
  items: string[],
  kind: languages.CompletionItemKind,
): SqlCompletionItem[] => items.map((item) => createCompletion(item, kind))

// Generate function completions
const generateFunctionCompletions = (
  functions: Array<{ name: string; signature: string }>,
): SqlCompletionItem[] =>
  functions.map((func) =>
    createCompletion(func.name, KIND.FUNCTION, func.signature),
  )

// Build the complete SQL completions array
export const SQL_COMPLETIONS: SqlCompletionItem[] = [
  // Generate all keyword completions
  ...Object.values(SQL_KEYWORDS)
    .flat()
    .map((keyword) => createCompletion(keyword, KIND.KEYWORD)),

  // Generate data type completions
  ...generateCompletions(POSTGRESQL_TYPES, KIND.CLASS),

  // Generate function completions
  ...Object.values(SQL_FUNCTIONS).flatMap(generateFunctionCompletions),
]
