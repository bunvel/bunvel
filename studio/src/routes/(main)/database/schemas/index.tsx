import { SchemaSelectorDiagram } from '@/components/database/schema-selector-diagram'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/database/schemas/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SchemaSelectorDiagram />
}
