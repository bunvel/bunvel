import { ColumnKeyIndicator } from '@/components/common/column-key-indicator'
import { TableKindIcon } from '@/components/common/table-kind-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  RelationshipEdge,
  TableNode,
} from '@/services/schema-diagram.service'
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from 'next-themes'
import { default as React, useMemo } from 'react'

// Custom node component for database tables
const TableNodeComponent: React.FC<{ data: TableNode }> = ({ data }) => {
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
    nodes: TableNode[]
    edges: RelationshipEdge[]
  }
}

export const SchemaDiagram: React.FC<SchemaDiagramProps> = ({ data }) => {
  const { theme, systemTheme } = useTheme()

  // Convert our data to ReactFlow format
  const initialNodes = useMemo<Node[]>(
    () =>
      data.nodes.map((node) => ({
        id: node.id,
        type: 'table',
        position: node.position,
        data: node as unknown as Record<string, unknown>,
      })),
    [data.nodes],
  )

  const initialEdges = useMemo<Edge[]>(
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

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const getEditorTheme = () => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light'
    }
    return theme === 'dark' ? 'dark' : 'light'
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        colorMode={getEditorTheme()}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background variant={BackgroundVariant.Cross} gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
