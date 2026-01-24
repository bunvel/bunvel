import { createServerFn } from '@tanstack/react-start'
import { READONLY_SCHEMAS } from './constant'

export const isReadonlySchema = (schema?: string): boolean => {
  return schema ? READONLY_SCHEMAS.includes(schema) : false
}

export const getEnv = createServerFn().handler(async () => {
  const API_URL = process.env.VITE_API_URL

  const BUNVEL_STUDIO_URL = process.env.VITE_BUNVEL_STUDIO_URL

  return { API_URL, BUNVEL_STUDIO_URL }
})

export const Env = await getEnv()

export function escapeIdentifier(identifier: string): string {
  return identifier.replace(/"/g, '""')
}

export function formatDefaultValue(value: string, type: string): string {
  const lowerType = type.toLowerCase()
  const lowerValue = value.toLowerCase().trim()

  // Handle common PostgreSQL functions that shouldn't be quoted
  const postgresqlFunctions = new Set([
    'now()',
    'current_timestamp',
    'current_date',
    'current_time',
    'uuid_generate_v4()',
    'gen_random_uuid()',
    'uuidv7()',
    'uuidv4()',
  ])

  if (postgresqlFunctions.has(lowerValue)) {
    return value
  }

  // Define exact type matches
  const stringTypes = new Set([
    'char',
    'varchar',
    'text',
    'character varying',
    'date',
    'time',
    'timestamp',
    'timestamptz',
    'timetz',
  ])

  // Check if type is in the string types set or contains known patterns
  const isStringLike =
    stringTypes.has(lowerType) ||
    /^(var)?char\(\d+\)$/.test(lowerType) ||
    lowerType.startsWith('timestamp') ||
    lowerType.startsWith('time')

  // For string types, wrap in single quotes and escape existing single quotes
  if (isStringLike) {
    return `'${escapeIdentifier(value)}'`
  }

  // For boolean values, convert to lowercase
  if (lowerType === 'boolean') {
    const normalized = value.toLowerCase().trim()
    const truthyValues = ['true', '1', 'yes', 'on', 't', 'y']
    return truthyValues.includes(normalized) ? 'TRUE' : 'FALSE'
  }

  // For JSON/JSONB, validate it's valid JSON
  if (lowerType === 'json' || lowerType === 'jsonb') {
    try {
      JSON.parse(value)
      return `'${escapeIdentifier(value)}'::${lowerType}`
    } catch (e) {
      throw new Error(`Invalid JSON value for ${lowerType} column`)
    }
  }

  // For numeric types, return as is
  return value
}
