import { apiClient, handleApiError } from '@/lib/api-client'
import { logWideEvent } from '@/lib/logger'
import { SQL_QUERIES } from '@/lib/sql-queries'
import type { DatabaseTables, TableKind } from '@/types/database'
import { createServerFn } from '@tanstack/react-start'

export interface TableNode {
  id: string
  name: string
  kind: TableKind
  description: string
  rowCount: number
  size: string
  columnCount: number
  columns: Array<ColumnInfo>
  position: { x: number; y: number }
}

export interface ColumnInfo {
  name: string
  dataType: string
  isNullable: boolean
  isPrimaryKey: boolean
  isForeignKey: boolean
  foreignTable?: string
  foreignColumn?: string
}

export interface RelationshipEdge {
  id: string
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
  type: 'foreign-key'
}

export interface SchemaDiagram {
  nodes: Array<TableNode>
  edges: Array<RelationshipEdge>
}

export const getSchemaDiagram = createServerFn({ method: 'POST' })
  .inputValidator((schema: string) => schema)
  .handler(async ({ data: schema }) => {
    try {
      // Get all tables in the schema
      const tablesResponse = await apiClient.post<Array<DatabaseTables>>(
        '/meta/query?key=GET_DATABASE_TABLES',
        {
          query: SQL_QUERIES.GET_DATABASE_TABLES,
          params: [schema],
        },
      )

      if (!Array.isArray(tablesResponse.data)) {
        throw new Error('Invalid response format: expected an array of tables')
      }

      const tables = tablesResponse.data
      const nodes: Array<TableNode> = []
      const edges: Array<RelationshipEdge> = []

      // Process each table to get columns and relationships
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i]

        // Get table metadata with foreign key information
        const metadataResponse = await apiClient.post(
          '/meta/query?key=GET_TABLE_METADATA',
          {
            query: SQL_QUERIES.GET_TABLE_METADATA,
            params: [schema, table.name],
          },
        )

        const columns: Array<ColumnInfo> = []
        if (Array.isArray(metadataResponse.data)) {
          for (const row of metadataResponse.data) {
            columns.push({
              name: row.column_name,
              dataType: row.data_type,
              isNullable: row.is_nullable,
              isPrimaryKey: row.is_primary_key,
              isForeignKey: row.is_foreign_key,
              foreignTable: row.foreign_table_name,
              foreignColumn: row.foreign_column_name,
            })
          }
        }

        // Create node with automatic layout positioning
        const node: TableNode = {
          id: `${schema}.${table.name}`,
          name: table.name,
          kind: table.kind,
          description: table.description || '',
          rowCount: table.row_count,
          size: table.total_size,
          columnCount: table.column_count,
          columns,
          position: {
            x: (i % 4) * 350, // 4 columns grid
            y: Math.floor(i / 4) * 400, // rows
          },
        }
        nodes.push(node)

        // Create edges for foreign key relationships
        for (const column of columns) {
          if (
            column.isForeignKey &&
            column.foreignTable &&
            column.foreignColumn
          ) {
            const edge: RelationshipEdge = {
              id: `${node.id}.${column.name}-${column.foreignTable}.${column.foreignColumn}`,
              source: node.id,
              target: `${schema}.${column.foreignTable}`,
              sourceHandle: column.name,
              targetHandle: column.foreignColumn,
              type: 'foreign-key',
            }
            edges.push(edge)
          }
        }
      }

      return {
        data: {
          nodes,
          edges,
        } as SchemaDiagram,
      }
    } catch (error) {
      logWideEvent('schema-diagram.fetch.error', { schema, error })
      handleApiError(error)
    }
  })
