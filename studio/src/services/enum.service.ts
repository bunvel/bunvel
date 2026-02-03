import type { CreateEnumParams, DatabaseEnum } from '@/types'
import { escapeIdentifier } from '@/utils/func'
import { QUERY_OPERATION_KEYS } from '@/utils/query-keys'
import { createServerFn } from '@tanstack/react-start'
import { apiClient, handleApiError } from '../lib/api-client'
import { logger } from '../lib/logger'
import { SQL_QUERIES } from '../lib/sql-queries'

export const getDatabaseEnums = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string }) => {
    if (!data?.schema) {
      throw new Error('Schema name is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    try {
      const response = await apiClient.post<DatabaseEnum[]>(
        '/meta/query?key=' + QUERY_OPERATION_KEYS.GET_DATABASE_ENUMS,
        {
          query: SQL_QUERIES.GET_ENUMS,
          params: [data.schema],
        },
      )
      return response.data as DatabaseEnum[]
    } catch (error) {
      logger.service('enum.service').error('Error fetching enums', error)
      handleApiError(error)
    }
  })

export const createEnum = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateEnumParams) => {
    if (!data?.schema || !data?.enumName) {
      throw new Error('Schema and enum name are required')
    }
    if (!data.values?.length) {
      throw new Error('At least one enum value is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { schema, enumName, values } = data

    // Escape identifiers
    const escapedSchema = escapeIdentifier(schema)
    const escapedEnumName = escapeIdentifier(enumName)

    // Escape enum values
    const escapedValues = values.map(
      (value) => `'${value.replace(/'/g, "''")}'`,
    )

    // Build CREATE TYPE query
    const query = `CREATE TYPE ${escapedSchema}.${escapedEnumName} AS ENUM (${escapedValues.join(', ')})`

    try {
      await apiClient.post('/meta/query', { query })
      return { success: true }
    } catch (error) {
      logger.service('enum.service').error('Error creating enum', error)
      throw error
    }
  })

export const deleteEnum = createServerFn({ method: 'POST' })
  .inputValidator((data: { schema: string; enumName: string }) => {
    if (!data?.schema || !data?.enumName) {
      throw new Error('Schema and enum name are required')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { schema, enumName } = data

    // Escape identifiers
    const escapedSchema = escapeIdentifier(schema)
    const escapedEnumName = escapeIdentifier(enumName)

    // Build DROP TYPE query
    const query = `DROP TYPE IF EXISTS ${escapedSchema}.${escapedEnumName}`

    try {
      await apiClient.post('/meta/query', { query })
      return { success: true }
    } catch (error) {
      logger.service('enum.service').error('Error deleting enum', error)
      throw error
    }
  })
