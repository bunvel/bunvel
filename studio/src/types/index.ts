// Re-export all types from organized modules
export * from './api'
export * from './components'
export * from './database'
export * from './history'
export * from './query'
export * from './sql'
export * from './table'
export * from './tabs'

// Keep existing interface for backward compatibility
export interface SchemaTable {
  schema: string
  table?: string
}