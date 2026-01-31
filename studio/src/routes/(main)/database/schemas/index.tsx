import { SchemaLayout } from '@/components/database/schema-layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/database/schemas/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SchemaLayout />
}
