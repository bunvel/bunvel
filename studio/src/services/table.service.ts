import type {
  CreateTableParams,
  DatabaseEnum,
  DatabaseFunction,
  DatabaseTableColumns,
  DatabaseTableIndexes,
  DatabaseTables,
  DatabaseTrigger,
  DeleteTableParams, Table
} from '@/types'
import { escapeIdentifier, formatDefaultValue } from '@/utils/func'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from './api-client'
import { SQL_QUERIES } from './sql-queries'

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

export const getDatabaseTables = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<DatabaseTables[]>('/meta/query', {
        query: SQL_QUERIES.GET_DATABASE_TABLES,
        params: [data.schema],
      })
      return response.data as DatabaseTables[]
    } catch (error) {
      console.error('Error fetching tables:', error)
      handleApiError(error)
    }
  })

export const getDatabaseTableColumns = createServerFn({ method: 'POST' })
  .inputValidator((data: { oid: string }) => {
    if (!data?.oid) {
      throw new Error('OID is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<DatabaseTableColumns[]>(
        '/meta/query',
        {
          query: SQL_QUERIES.GET_TABLE_COLUMNS,
          params: [data.oid],
        },
      )
      return response.data as DatabaseTableColumns[]
    } catch (error) {
      console.error('Error fetching tables:', error)
      handleApiError(error)
    }
  })

export const getDatabaseTableIndexes = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<DatabaseTableIndexes[]>(
        '/meta/query',
        {
          query: SQL_QUERIES.GET_TABLE_INDEXES,
          params: [data.schema],
        },
      )
      return response.data as DatabaseTableIndexes[]
    } catch (error) {
      console.error('Error fetching table indexes:', error)
      handleApiError(error)
    }
  })

export const getDatabaseEnums = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<DatabaseEnum[]>('/meta/query', {
        query: SQL_QUERIES.GET_ENUMS,
        params: [data.schema],
      })
      return response.data as DatabaseEnum[]
    } catch (error) {
      console.error('Error fetching enums:', error)
      handleApiError(error)
    }
  })

export const getDatabaseTriggers = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => ({
    schema: data.schema || 'public',
  }))
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<DatabaseTrigger[]>('/meta/query', {
        query: SQL_QUERIES.GET_TRIGGERS,
        params: [data.schema],
      })
      return response.data as DatabaseTrigger[]
    } catch (error) {
      console.error('Error fetching triggers:', error)
      handleApiError(error)
    }
  })

export const getDatabaseFunctions = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => ({
    schema: data.schema || 'public',
  }))
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<DatabaseFunction[]>('/meta/query', {
        query: SQL_QUERIES.GET_FUNCTIONS,
        params: [data.schema],
      })
      return response.data as DatabaseFunction[]
    } catch (error) {
      console.error('Error fetching functions:', error)
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

export const truncateTable = createServerFn({ method: 'POST' })
  .inputValidator((data: Omit<DeleteTableParams, 'cascade'>) => {
    if (!data?.schema || !data?.table) {
      throw new Error('Schema and table names are required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const { schema, table } = data
      const query = `TRUNCATE TABLE "${escapeIdentifier(schema)}"."${escapeIdentifier(table)}" CASCADE`

      await apiClient.post('/meta/query', { query })
      return { success: true }
    } catch (error) {
      console.error('Error truncating table:', error)
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
      const lowerType = col.type.toLowerCase()
      let def = `${escapedName} ${col.type.toUpperCase()}`
      
      // Handle primary key based on data type
      if (col.isPrimaryKey && hasSinglePK) {
        // Auto-increment for integer types
        if (['smallint', 'integer', 'int', 'bigint'].includes(lowerType)) {
          def += ' GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY'
        }
        // UUID generation for UUID types
        else if (['uuid'].includes(lowerType)) {
          def += ' PRIMARY KEY DEFAULT uuidv7()'
        }
        // Default primary key for other types
        else {
          def += ' PRIMARY KEY'
        }
      }
      
      if (!col.nullable && !col.isPrimaryKey) def += ' NOT NULL'
      
      // Handle default values (skip if already handled for UUID PK)
      if (col.defaultValue !== undefined && !(col.isPrimaryKey && hasSinglePK && lowerType === 'uuid')) {
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
