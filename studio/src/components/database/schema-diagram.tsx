import { ColumnKeyIndicator } from '@/components/common/column-key-indicator'
import { TableKindIcon } from '@/components/common/table-kind-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  RelationshipEdge,
  TableNode,
} from '@/services/schema-diagram.service'
import type { Connection, Edge, Node } from '@xyflow/react'
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from 'better-themes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SchemaTableEditorSheet } from './schema-table-editor-sheet'
import { SchemaForeignKeyDialog } from './schema-foreign-key-dialog'
import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useQueryClient } from '@tanstack/react-query'
import { reactQueryKeys } from '@/utils/react-query-keys'
import { toast } from 'sonner'

// Custom node component for database tables
const TableNodeComponent = ({ data }: { data: TableNode }) => {
  return (
    <Card className="min-w-[280px] max-w-[320px] p-0 gap-0">
      {/* Table Header */}
      <CardHeader className="p-3 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableKindIcon
              kind={data.kind}
              className="text-primary-foreground"
            />
            <CardTitle className="font-semibold">{data.name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="divide-y bg-sidebar-accent p-0">
        {data.columns.map((column) => (
          <div key={column.name} className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Handle for connections */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={column.name}
                  className={`w-2 h-2 bg-border border border-background`}
                  style={{ right: -4 }}
                />
                <Handle
                  type="target"
                  position={Position.Left}
                  id={column.name}
                  className={`w-2 h-2 bg-border border border-background`}
                  style={{ left: -4 }}
                />

                {/* Column name and indicators */}
                <div className="flex items-center gap-1">
                  <ColumnKeyIndicator
                    isPrimaryKey={column.isPrimaryKey}
                    isForeignKey={column.isForeignKey}
                  />
                  <span className="text-sm text-foreground">{column.name}</span>
                </div>
              </div>

              {/* Data type */}
              <div className="text-xs text-muted-foreground text-right">
                {column.dataType}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Node types for ReactFlow
const nodeTypes = {
  table: TableNodeComponent,
}

interface SchemaDiagramProps {
  data: {
    nodes: Array<TableNode>
    edges: Array<RelationshipEdge>
  }
}

export const SchemaDiagram = ({ data }: SchemaDiagramProps) => {
  const { theme, systemTheme } = useTheme()
  const queryClient = useQueryClient()
  const executeSqlMutation = useExecuteSqlQuery()

  // Selection & overlay states
  const [editingTable, setEditingTable] = useState<TableNode | null>(null)
  const [pendingConnection, setPendingConnection] = useState<{
    sourceTable: string
    sourceColumn: string
    targetTable: string
    targetColumn: string
    schema: string
  } | null>(null)
  const [foreignKeyDialogOpen, setForeignKeyDialogOpen] = useState(false)

  // Convert our data to ReactFlow format
  const initialNodes = useMemo<Array<Node>>(
    () =>
      data.nodes.map((node) => ({
        id: node.id,
        type: 'table',
        position: node.position,
        data: node as unknown as Record<string, unknown>,
      })),
    [data.nodes],
  )

  const initialEdges = useMemo<Array<Edge>>(
    () =>
      data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true,
        style: {
          strokeWidth: 2,
          stroke: '#5841BD',
        },
      })),
    [data.edges],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Sync state with dynamic API data updates
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const activeSchema = useMemo(() => {
    if (data.nodes.length === 0) return 'public'
    return data.nodes[0].id.split('.')[0] || 'public'
  }, [data.nodes])

  // Invalidate schema details in cache to force re-render
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: reactQueryKeys.schemaDiagram.detail(activeSchema),
    })
    queryClient.invalidateQueries({
      queryKey: reactQueryKeys.tables.list(activeSchema),
    })
    queryClient.invalidateQueries({
      queryKey: reactQueryKeys.databaseTables.list(activeSchema),
    })
  }, [queryClient, activeSchema])

  // Connection drawn handler
  const onConnect = useCallback((connection: Connection) => {
    const { source, target, sourceHandle, targetHandle } = connection
    if (!source || !target || !sourceHandle || !targetHandle) return

    const [sourceSchema, sourceTable] = source.split('.')
    const [, targetTable] = target.split('.')

    if (source === target) {
      toast.error(
        'Cannot create self-referencing foreign key via drag and drop',
      )
      return
    }

    setPendingConnection({
      sourceTable,
      sourceColumn: sourceHandle,
      targetTable,
      targetColumn: targetHandle,
      schema: sourceSchema || 'public',
    })
    setForeignKeyDialogOpen(true)
  }, [])

  // Create FK constraint SQL builder
  const handleCreateForeignKey = (
    constraintName: string,
    onDelete: string,
    onUpdate: string,
  ) => {
    if (!pendingConnection) return

    const { schema, sourceTable, sourceColumn, targetTable, targetColumn } =
      pendingConnection
    const sql = `ALTER TABLE "${schema}"."${sourceTable}" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${sourceColumn}") REFERENCES "${schema}"."${targetTable}" ("${targetColumn}") ON DELETE ${onDelete} ON UPDATE ${onUpdate};`

    executeSqlMutation.mutate(sql, {
      onSuccess: () => {
        toast.success(`Foreign key constraint "${constraintName}" created`)
        handleRefresh()
        setForeignKeyDialogOpen(false)
        setPendingConnection(null)
      },
      onError: (error) => {
        toast.error('Failed to create foreign key relationship', {
          description:
            error instanceof Error ? error.message : 'Unknown database error',
        })
      },
    })
  }

  const getEditorTheme = () => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light'
    }
    return theme === 'dark' ? 'dark' : 'light'
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        colorMode={getEditorTheme()}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={(_, node) => {
          const fullNode = data.nodes.find((n) => n.id === node.id)
          if (fullNode) {
            setEditingTable(fullNode)
          }
        }}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background variant={BackgroundVariant.Cross} gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Side sheet column designer */}
      <SchemaTableEditorSheet
        open={editingTable !== null}
        onOpenChange={(open) => !open && setEditingTable(null)}
        schema={activeSchema}
        tableNode={editingTable}
        onSave={handleRefresh}
      />

      {/* Confirmation dialog for FK drawing */}
      <SchemaForeignKeyDialog
        open={foreignKeyDialogOpen}
        onOpenChange={setForeignKeyDialogOpen}
        connection={pendingConnection}
        onConfirm={handleCreateForeignKey}
        isPending={executeSqlMutation.isPending}
      />
    </div>
  )
}
