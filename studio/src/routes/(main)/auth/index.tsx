import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="flex items-center justify-center h-full">Auth not yet implemented</div>
}
