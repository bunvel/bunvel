import { MUTATION_KEYWORDS, READONLY_SCHEMAS } from "@/constants/app"


/**
 * Check if a schema is restricted
 */
export function isRestrictedSchema(schema?: string): boolean {
  return READONLY_SCHEMAS.includes(schema || '')
}

/**
 * Check if a query is a mutation operation
 */
function isMutationQuery(query: string): boolean {
  const upperQuery = query.toUpperCase()
  return MUTATION_KEYWORDS.some((keyword) =>
    upperQuery.includes(keyword),
  )
}

/**
 * Check if a query targets a restricted schema
 * Matches patterns like auth.table, storage.table, AUTH.TABLE, STORAGE.TABLE, etc.
 */
function targetsRestrictedSchema(query: string): boolean {
  const upperQuery = query.toUpperCase()
  // Check for any restricted schema.table pattern
  const restrictedSchemaPattern = new RegExp(
    `(${READONLY_SCHEMAS.join('|')})\\.\\s*\\w+`,
    'i',
  )
  return restrictedSchemaPattern.test(upperQuery)
}

/**
 * Validate that a query doesn't mutate restricted schema tables
 * Throws an error if the query is a mutation targeting a restricted schema
 */
export function validateRestrictedSchemaQuery(query: string): void {
  if (targetsRestrictedSchema(query) && isMutationQuery(query)) {
    throw new Error(
      'Mutations on restricted schemas are not allowed. These schemas are managed by Bunvel and are read-only.',
    )
  }
}
