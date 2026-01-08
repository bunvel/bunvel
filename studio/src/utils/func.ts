import { createServerFn } from '@tanstack/react-start'
import { READONLY_SCHEMAS } from './constant'

export const isReadonlySchema = (schema?: string): boolean => {
  return schema ? READONLY_SCHEMAS.includes(schema) : false
}

export const getEnv = createServerFn().handler(async () => {
  const DEFAULT_ORG = process.env.VITE_STUDIO_DEFAULT_ORGANIZATION

  const DEFAULT_PROJECT = process.env.VITE_STUDIO_DEFAULT_PROJECT

  const API_URL = process.env.VITE_API_URL

  const BUNVEL_STUDIO_URL = process.env.VITE_BUNVEL_STUDIO_URL

  return { DEFAULT_ORG, DEFAULT_PROJECT, API_URL, BUNVEL_STUDIO_URL }
})

export const Env = await getEnv()

export function formatDefaultValue(value: string, type: string): string {
  const lowerType = type.toLowerCase()

  // For string types, wrap in single quotes and escape existing single quotes
  if (
    lowerType.includes('char') ||
    lowerType.includes('text') ||
    lowerType.includes('date') ||
    lowerType.includes('time')
  ) {
    return `'${value.replace(/'/g, "''")}'`
  }

  // For boolean values, convert to lowercase
  if (lowerType === 'boolean') {
    return value.toLowerCase() === 'true' ? 'TRUE' : 'FALSE'
  }

  // For JSON/JSONB, validate it's valid JSON
  if (lowerType === 'json' || lowerType === 'jsonb') {
    try {
      JSON.parse(value)
      return `'${value.replace(/'/g, "''")}'::${lowerType}`
    } catch (e) {
      throw new Error(`Invalid JSON value for ${lowerType} column: ${value}`)
    }
  }

  // For numeric types, return as is
  return value
}

