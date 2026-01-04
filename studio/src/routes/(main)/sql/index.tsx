import { SqlEditor } from '@/components/sql/sql-editor'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/sql/')({
  component: SqlPage,
})

function SqlPage() {
  return <SqlEditor />
}