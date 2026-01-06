import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchemas } from '@/hooks/queries/useSchemas'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { CreateSchemaSheet } from './create-schema-sheet'

interface Schema {
  schema_name: string
}

interface SearchParams {
  schema?: string
  table?: string
  [key: string]: unknown
}

export function SchemaSelector() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as SearchParams

  const { data: schemas, error, isFetching, refetch } = useSchemas()

  const hasPublicSchema = schemas?.data?.some(
    (s: Schema) => s.schema_name === 'public',
  )
  const defaultSchema = hasPublicSchema ? 'public' : ''

if (isFetching) {
  return (
    <div className="flex gap-1 px-4 py-2">
      <div className="h-8 w-full rounded-md border border-input px-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="h-8 w-9 rounded-md border border-input flex items-center justify-center">
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  )
}

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading schemas: {error.message}
        <Button variant="link" onClick={() => refetch()} className="ml-2">Retry</Button>
      </div>
    )
  }

  if (defaultSchema && !search.schema) {
    navigate({
      search: (prev: SearchParams) => ({
        ...prev,
        schema: defaultSchema,
      }),
    } as any)
  }

  const handleSchemaChange = (value: string | null) => {
    navigate({
      search: (prev: SearchParams) => ({
        ...prev,
        schema: value || defaultSchema,
        table: undefined,
      }),
    } as any)
  }

  return (
    <div className="flex gap-1 px-4 py-2">
      <Select
        onValueChange={handleSchemaChange}
        value={search.schema || defaultSchema}
        defaultValue={defaultSchema}
      >
        <SelectTrigger className="w-full">
          <SelectValue title="Select a schema" />
        </SelectTrigger>
        <SelectContent>
          {schemas?.data?.map((schema: Schema) => (
            <SelectItem key={schema.schema_name} value={schema.schema_name}>
              {schema.schema_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <CreateSchemaSheet />
    </div>
  )
}
