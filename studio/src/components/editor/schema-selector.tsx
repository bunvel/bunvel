import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchemas } from '@/hooks/queries/useSchemas'
import { Schema } from '@/services/schema.service'
import { SchemaTable } from '@/types'
import {
  useNavigate,
  useSearch,
  type NavigateOptions,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { CreateSchemaSheet } from './create-schema-sheet'

export function SchemaSelector({ hideCreate = true }: { hideCreate: boolean }) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as SchemaTable
  const { data: schemas, error, isFetching, refetch } = useSchemas()

  // Calculate derived state
  const hasPublicSchema = schemas?.data?.some(
    (s: Schema) => s.schema_name === 'public',
  )
  const defaultSchema = hasPublicSchema ? 'public' : ''

  // Handle navigation effect
  useEffect(() => {
    if (defaultSchema && !search.schema) {
      navigate({
        search: (prev: SchemaTable) => ({
          ...prev,
          schema: defaultSchema,
        }),
      } as NavigateOptions)
    }
  }, [defaultSchema, search.schema, navigate])

  // Loading state
  if (isFetching) {
    return (
      <div className="flex gap-1 px-4 py-2">
        <div className="h-8 w-full rounded-md border border-input px-3 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
        </div>
        {!hideCreate && (
          <div className="h-8 w-9 rounded-md border border-input flex items-center justify-center">
            <Skeleton className="h-4 w-4" />
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 space-y-2">
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
          <h4 className="mb-1 text-sm font-medium text-destructive">
            Error loading schema
          </h4>
          <p className="text-xs text-destructive/80">
            {error instanceof Error
              ? error.message
              : 'An unknown error occurred'}
            <Button variant="link" onClick={() => refetch()} className="ml-2">
              Retry
            </Button>
          </p>
        </div>
      </div>
    )
  }

  const handleSchemaChange = (value: string | null) => {
    navigate({
      search: (prev: SchemaTable) => ({
        ...prev,
        schema: value || defaultSchema,
        table: undefined,
      }),
    } as NavigateOptions)
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
      {!hideCreate && <CreateSchemaSheet />}
    </div>
  )
}
