import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchemaDiagram } from '@/hooks/queries/useSchemaDiagram'
import { useSchemas } from '@/hooks/queries/useSchemas'
import { TableIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import React, { useState } from 'react'
import { Spinner } from '../ui/spinner'
import { SchemaDiagram } from './schema-diagram'

export const SchemaSelectorDiagram: React.FC = () => {
  const [selectedSchema, setSelectedSchema] = useState<string>('')

  const { data: schemas, isLoading: schemasLoading } = useSchemas()
  const {
    data: diagramData,
    isLoading: diagramLoading,
    error: diagramError,
  } = useSchemaDiagram(selectedSchema)

  const availableSchemas = schemas?.data || []

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Schema Selector */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HugeiconsIcon icon={TableIcon} className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Schema Diagram</h1>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={selectedSchema}
              onValueChange={(value) => setSelectedSchema(value || '')}
              disabled={schemasLoading}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a schema" />
              </SelectTrigger>
              <SelectContent>
                {availableSchemas.map((schema) => (
                  <SelectItem
                    key={schema.schema_name}
                    value={schema.schema_name}
                  >
                    {schema.schema_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSchema && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSchema('')}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Diagram Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedSchema ? (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader className="text-center">
                <HugeiconsIcon
                  icon={TableIcon}
                  className="w-12 h-12 text-primary mx-auto mb-2"
                />
                <CardTitle>Select a Schema</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Choose a schema from the dropdown above to view its diagram
                  with tables and relationships.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : diagramLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Spinner />
              <p className="text-muted-foreground">Loading schema diagram...</p>
            </div>
          </div>
        ) : diagramError ? (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Error Loading Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {diagramError instanceof Error
                    ? diagramError.message
                    : 'Failed to load schema diagram'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : diagramData?.data ? (
          <SchemaDiagram data={diagramData.data} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>No Tables Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The selected schema doesn't contain any tables or views.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
