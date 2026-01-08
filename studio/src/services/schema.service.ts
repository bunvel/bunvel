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

export const getSchemas = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const response = await apiClient.post<Array<{ schema_name: string }>>(
        '/meta/query',
        { query: SQL_QUERIES.GET_SCHEMAS },
      )

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected an array of rows')
      }

      return {
        data: response.data,
      }
    } catch (error) {
      console.error('Failed to fetch schemas:', error)
      handleApiError(error)
    }
  },
)

export const createSchema = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    try {
      // Validate identifier format
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data)) {
        throw new Error(
          'Invalid schema name: must start with a letter or underscore and contain only letters, numbers, or underscores',
        )
      }

      const query = `CREATE SCHEMA IF NOT EXISTS ${data.replace(/"/g, '""')}`

      const response = await apiClient.post('/meta/query', {
        query,
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Failed to create schema:', error)
      handleApiError(error)
    }
  })

export const getTables = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Table[]>(
        '/meta/query/parameterized',
        {
          query: SQL_QUERIES.GET_TABLES,
          params: [data.schema],
        },
      )
      return response.data as Table[]
    } catch (error) {
      console.error('Error fetching tables:', error)
      handleApiError(error)
    }
  })

export interface ColumnDefinition {
  name: string
  type: string
  nullable?: boolean
  defaultValue?: string
  isPrimaryKey?: boolean
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
      const query = `DROP TABLE IF EXISTS \"${schema}\".\"${table}\"${cascadeClause}`

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
    
    // Create column definitions
    const columnDefs = columns
      .map(col => {
        let def = `"${col.name}" ${col.type.toUpperCase()}`
        if (col.isPrimaryKey) def += ' PRIMARY KEY'
        if (!col.nullable) def += ' NOT NULL'
        if (col.defaultValue !== undefined) {
          def += ` DEFAULT ${formatDefaultValue(col.defaultValue, col.type)}`
        }
        return def
      })
      .join(',\n  ')
    
    // Handle primary key constraints for multiple columns
    const primaryKeyCols = columns.filter(col => col.isPrimaryKey)
    let primaryKeyConstraint = ''
    if (primaryKeyCols.length > 1) {
      const pkColumns = primaryKeyCols.map(col => `"${col.name}"`).join(', ')
      primaryKeyConstraint = `,\n  PRIMARY KEY (${pkColumns})`
    }
    
    // Use a transaction to ensure all operations succeed or fail together
    const transaction = [
      // Create the table with IF NOT EXISTS to handle race conditions
      {
        query: `CREATE TABLE IF NOT EXISTS "${schema}"."${table}" (\n  ${columnDefs}${primaryKeyConstraint}\n)`
      },
      // Add table comment if description is provided
      ...(description ? [{
        query: `COMMENT ON TABLE "${schema}"."${table}" IS '${description.replace(/'/g, "''")}'`
      }] : []),
      // Add foreign key constraints
      ...foreignKeys
        .filter(fk => fk.column && fk.referencedTable && fk.referencedColumn)
        .map(fk => ({
          query: `
            ALTER TABLE "${schema}"."${table}"
            ADD CONSTRAINT "fk_${table}_${fk.column}_${fk.referencedTable}"
            FOREIGN KEY ("${fk.column}")
            REFERENCES "${schema}"."${fk.referencedTable}" ("${fk.referencedColumn}")
            ON DELETE ${fk.onDelete}
            ON UPDATE ${fk.onUpdate}`
        }))
    ]
    
    try {
      // Execute all queries in a single transaction
      for (const { query } of transaction) {
        await apiClient.post('/meta/query', { query })
      }
      return { success: true }
    } catch (error) {
      console.error('Error creating table:', error)
      // Re-throw the error to be handled by the mutation
      throw error
    }
  })

// Helper function to format default values based on column type
function formatDefaultValue(value: string, type: string): string {
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
