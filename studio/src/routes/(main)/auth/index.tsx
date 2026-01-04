import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/auth/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(main)/auth/"!</div>
}
