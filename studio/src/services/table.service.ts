import { apiClient, handleApiError } from '@/lib/api-client'
import { logWideEvent } from '@/lib/logger'
import { SQL_QUERIES } from '@/lib/sql-queries'
import type {
  CreateTableParams,
  DatabaseFunction,
  DatabaseTableColumns,
  DatabaseTables,
  DatabaseTrigger,
  DeleteTableParams,
  Table,
} from '@/types/database'
import { escapeIdentifier, formatDefaultValue } from '@/utils/func'
import { QUERY_OPERATION_KEYS } from '@/utils/query-keys'
import { createServerFn } from '@tanstack/react-start'

export const getTables = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Array<Table>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_TABLES,
        {
          query: SQL_QUERIES.GET_ALL_TABLES,
          params: [data.schema],
        },
      )
      return response.data as Array<Table>
    } catch (error) {
      logWideEvent('tables.fetch.error', { schema: data.schema, error })
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
      const response = await apiClient.post<Array<DatabaseTables>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_DATABASE_TABLES,
        {
          query: SQL_QUERIES.GET_DATABASE_TABLES,
          params: [data.schema],
        },
      )

      return response.data as Array<DatabaseTables>
    } catch (error) {
      logWideEvent('tables.fetch.error', { schema: data.schema, error })
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
      const response = await apiClient.post<Array<DatabaseTableColumns>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_TABLE_COLUMNS,
        {
          query: SQL_QUERIES.GET_TABLE_COLUMNS,
          params: [data.oid],
        },
      )
      return response.data as Array<DatabaseTableColumns>
    } catch (error) {
      logWideEvent('table.columns.fetch.error', { oid: data.oid, error })
      handleApiError(error)
    }
  })

export const getDatabaseTriggers = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => ({
    schema: data.schema || 'public',
  }))
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Array<DatabaseTrigger>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_DATABASE_TRIGGERS,
        {
          query: SQL_QUERIES.GET_TRIGGERS,
          params: [data.schema],
        },
      )
      return response.data as Array<DatabaseTrigger>
    } catch (error) {
      logWideEvent('table.triggers.fetch.error', { schema: data.schema, error })
      handleApiError(error)
    }
  })

export const getDatabaseFunctions = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => ({
    schema: data.schema || 'public',
  }))
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<Array<DatabaseFunction>>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_DATABASE_FUNCTIONS,
        {
          query: SQL_QUERIES.GET_FUNCTIONS,
          params: [data.schema],
        },
      )
      return response.data as Array<DatabaseFunction>
    } catch (error) {
      logWideEvent('table.functions.fetch.error', {
        schema: data.schema,
        error,
      })
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

      await apiClient.post(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.DELETE_TABLE,
        { query },
      )
      return { success: true }
    } catch (error) {
      logWideEvent('table.delete.error', {
        schema: data.schema,
        table: data.table,
        error,
      })
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

      await apiClient.post(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.TRUNCATE_TABLE,
        { query },
      )
      return { success: true }
    } catch (error) {
      logWideEvent('table.truncate.error', {
        schema: data.schema,
        table: data.table,
        error,
      })
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
    const primaryKeyCols = columns.filter((col: any) => col.isPrimaryKey)
    const hasSinglePK = primaryKeyCols.length === 1

    const columnDefs = columns.map((col: any) => {
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
      if (
        col.defaultValue !== undefined &&
        col.defaultValue.trim() !== '' &&
        !(col.isPrimaryKey && hasSinglePK && lowerType === 'uuid')
      ) {
        try {
          const formattedDefault = formatDefaultValue(
            col.defaultValue,
            col.type,
          )
          def += ` DEFAULT ${formattedDefault}`
        } catch (error) {
          // Skip default value if formatting fails
          logWideEvent('table.column.default.warn', {
            columnName: col.name,
            defaultValue: col.defaultValue,
            error,
          })
        }
      }

      return def
    })

    // Add composite primary key if needed
    if (primaryKeyCols.length > 1) {
      const pkColumns = primaryKeyCols
        .map((col: any) => escapeIdentifier(col.name))
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
      .filter(
        (fk: any) => fk.column && fk.referencedTable && fk.referencedColumn,
      )
      .forEach((fk: any, index: number) => {
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
      await apiClient.post(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.CREATE_TABLE,
        { query },
      )
      return { success: true }
    } catch (error) {
      logWideEvent('table.create.error', {
        schema: data.schema,
        table: data.table,
        error,
      })
      throw error
    }
  })
