export const createTableKey = (schema: string, table: string): string => 
  `${schema}.${table}`

export const parseTableKey = (tableKey: string): { schema: string; table: string } => {
  const [schema, table] = tableKey.split('.')
  return { schema, table }
}

export const isValidTableKey = (tableKey: string): boolean => {
  const parts = tableKey.split('.')
  return parts.length === 2 && parts.every(part => part.length > 0)
}
