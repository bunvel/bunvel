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

    // Create column definitions

    const primaryKeyCols = columns.filter((col) => col.isPrimaryKey)
    const hasSinglePK = primaryKeyCols.length === 1

    const columnDefs = columns
      .map((col) => {
        const escapedName = escapeIdentifier(col.name)
        let def = `${escapedName} ${col.type.toUpperCase()}`
        if (col.isPrimaryKey && hasSinglePK) def += ' PRIMARY KEY'
        if (!col.nullable) def += ' NOT NULL'
        if (col.defaultValue !== undefined) {
          def += ` DEFAULT ${formatDefaultValue(col.defaultValue, col.type)}`
        }
        return def
      })
      .join(',\n  ')

    // Handle primary key constraints for multiple columns
    let primaryKeyConstraint = ''
    if (primaryKeyCols.length > 1) {
      const pkColumns = primaryKeyCols
        .map((col) => escapeIdentifier(col.name))
        .join(', ')
      primaryKeyConstraint = `,\n  PRIMARY KEY (${pkColumns})`
    }

    // Use a transaction to ensure all operations succeed or fail together
    const transaction = [
      // Create the table with IF NOT EXISTS to handle race conditions
      {
        query: `CREATE TABLE IF NOT EXISTS "${escapeIdentifier(schema)}"."${escapeIdentifier(table)}" (\n  ${columnDefs}${primaryKeyConstraint}\n)`,
      },
      // Add table comment if description is provided
      ...(description
        ? [
            {
              query: `COMMENT ON TABLE "${escapeIdentifier(schema)}"."${escapeIdentifier(table)}" IS '${description.replace(/'/g, "''")}'`,
            },
          ]
        : []),
      // Add foreign key constraints
      ...foreignKeys
        .filter((fk) => fk.column && fk.referencedTable && fk.referencedColumn)
        .map((fk) => ({
          query: `
            ALTER TABLE "${escapeIdentifier(schema)}"."${escapeIdentifier(table)}"
            ADD CONSTRAINT "fk_${escapeIdentifier(table)}_${escapeIdentifier(fk.column)}_${escapeIdentifier(fk.referencedTable)}"
            FOREIGN KEY ("${escapeIdentifier(fk.column)}")
            REFERENCES "${escapeIdentifier(schema)}"."${escapeIdentifier(fk.referencedTable)}" ("${escapeIdentifier(fk.referencedColumn)}")
            ON DELETE ${fk.onDelete}
            ON UPDATE ${fk.onUpdate}`,
        })),
    ]

    try {
      // Start transaction
      await apiClient.post('/meta/query', { query: 'BEGIN' })

      // Execute all queries in the transaction
      for (const { query } of transaction) {
        await apiClient.post('/meta/query', { query })
      }

      // Commit the transaction if all queries succeed
      await apiClient.post('/meta/query', { query: 'COMMIT' })
      return { success: true }
    } catch (error) {
      console.error('Error in table transaction:', error)
      // Rollback the transaction on error
      try {
        await apiClient.post('/meta/query', { query: 'ROLLBACK' })
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError)
        // Continue with original error
      }
      // Re-throw the original error to be handled by the mutation
      throw error
    }
  })
