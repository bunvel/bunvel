import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSchemaDiagram } from '@/hooks/queries/useSchemaDiagram'
import { Spinner } from '@/components/ui/spinner'
import { SchemaDiagram } from './schema-diagram'

export const SchemaLayout = () => {
  const {
    data: diagramData,
    isLoading: diagramLoading,
    error: diagramError,
  } = useSchemaDiagram('public')

  return (
    <div className="w-full h-full flex flex-col">
      {/* Diagram Content */}
      <div className="flex-1 overflow-hidden">
        {diagramLoading ? (
          <div className="h-full flex items-center justify-center gap-2">
            <Spinner />
            <p className="text-muted-foreground">Loading schema diagram...</p>
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
                  The public schema doesn't contain any tables or views.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
