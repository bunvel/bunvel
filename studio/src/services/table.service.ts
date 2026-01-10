import { escapeIdentifier, formatDefaultValue } from '@/utils/func'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'

export interface ColumnDefinition {
  name: string
  type: string
  nullable?: boolean
  defaultValue?: string
  isPrimaryKey?: boolean
}

export interface Table {
  name: string
  kind: 'BASE TABLE' | 'VIEW' | 'MATERIALIZED VIEW' | string
  columns?: ColumnDefinition[]
}

export interface ForeignKeyDefinition {
  column: string
  referencedTable: string
  referencedColumn: string
  onDelete: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'SET DEFAULT'
  onUpdate: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'SET DEFAULT'
}

export interface CreateTableParams {
  schema: string
  table: string
  description: string
  columns: ColumnDefinition[]
  foreignKeys?: ForeignKeyDefinition[]
}

export interface DeleteTableParams {
  schema: string
  table: string
  cascade: boolean
}

export const getTables = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Table[]>('/meta/query', {
        query: SQL_QUERIES.GET_TABLES,
        params: [data.schema],
      })
      return response.data as Table[]
    } catch (error) {
      console.error('Error fetching tables:', error)
      handleApiError(error)
    }
  })

export const deleteTable = createServerFn({ method: 'POST' })
  .inputValidator((data: DeleteTableParams) => {
    if (!data?.schema || !data?.table) {
      throw new Error('Schema and table names are required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const { schema, table, cascade } = data
      const cascadeClause = cascade ? ' CASCADE' : ''
      const query = `DROP TABLE IF EXISTS "${escapeIdentifier(schema)}"."${escapeIdentifier(table)}"${cascadeClause}`

      await apiClient.post('/meta/query', { query })
      return { success: true }
    } catch (error) {
      console.error('Error deleting table:', error)
      handleApiError(error)
    }
  })

export const createTable = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateTableParams) => {
    if (!data?.schema || !data?.table) {
      throw new Error('Schema and table names are required')
    }
    if (!data.columns?.length) {
      throw new Error('At least one column is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { schema, table, description, columns, foreignKeys = [] } = data

    // Escape identifiers once
    const escapedSchema = escapeIdentifier(schema)
    const escapedTable = escapeIdentifier(table)
    const fullTableName = `${escapedSchema}.${escapedTable}`

    // Build column definitions
    const primaryKeyCols = columns.filter((col) => col.isPrimaryKey)
    const hasSinglePK = primaryKeyCols.length === 1

    const columnDefs = columns.map((col) => {
      const escapedName = escapeIdentifier(col.name)
      let def = `${escapedName} ${col.type.toUpperCase()}`
      if (col.isPrimaryKey && hasSinglePK) def += ' PRIMARY KEY'
      if (!col.nullable) def += ' NOT NULL'
      if (col.defaultValue !== undefined) {
        def += ` DEFAULT ${formatDefaultValue(col.defaultValue, col.type)}`
      }
      return def
    })

    // Add composite primary key if needed
    if (primaryKeyCols.length > 1) {
      const pkColumns = primaryKeyCols
        .map((col) => escapeIdentifier(col.name))
        .join(', ')
      columnDefs.push(`PRIMARY KEY (${pkColumns})`)
    }

    // Build the main CREATE TABLE query
    let query = `CREATE TABLE IF NOT EXISTS ${fullTableName} (\n  ${columnDefs.join(',\n  ')}\n)`

    // Add table comment if description is provided
    if (description) {
      query += `;\nCOMMENT ON TABLE ${fullTableName} IS '${description.replace(/'/g, "''")}'`
    }

    // Add foreign key constraints
    foreignKeys
      .filter((fk) => fk.column && fk.referencedTable && fk.referencedColumn)
      .forEach((fk, index) => {
        const fkName = `fk_${table}_${fk.column}_${fk.referencedTable}_${index}`
        query +=
          `;\nALTER TABLE ${fullTableName} ` +
          `ADD CONSTRAINT "${fkName}" ` +
          `FOREIGN KEY ("${escapeIdentifier(fk.column)}") ` +
          `REFERENCES ${escapedSchema}."${escapeIdentifier(fk.referencedTable)}" ` +
          `("${escapeIdentifier(fk.referencedColumn)}") ` +
          `ON DELETE ${fk.onDelete || 'NO ACTION'} ` +
          `ON UPDATE ${fk.onUpdate || 'NO ACTION'}`
      })

    try {
      // Execute as a single query
      await apiClient.post('/meta/query', { query })
      return { success: true }
    } catch (error) {
      console.error('Error creating table:', error)
      throw error
    }
  })
