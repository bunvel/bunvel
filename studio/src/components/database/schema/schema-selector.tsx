import { CreateSchemaSheet } from '@/components/sheets/create-schema-sheet'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchemas } from '@/hooks/queries/useSchemas'
import type { Schema } from '@/types/database'
import type { NavigateOptions } from '@tanstack/react-router'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useEffectEvent } from 'react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { HugeiconsIcon } from '@hugeicons/react'
import { DatabaseIcon } from '@hugeicons/core-free-icons'

import { isRestrictedSchema } from '@/lib/restricated-schema'

export function SchemaSelector({ hideCreate = true }: { hideCreate: boolean }) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as {
    schema?: string
    table?: string
  }
  const { data: schemas, error, isFetching, refetch } = useSchemas()

  // Calculate derived state
  const hasPublicSchema = schemas?.data?.some(
    (s: Schema) => s.schema_name === 'public',
  )
  const defaultSchema = hasPublicSchema ? 'public' : ''
  const currentSchema = search.schema || defaultSchema

  // Handle navigation effect with latest navigate function
  const handleAutoNavigate = useEffectEvent((schema: string) => {
    navigate({
      search: (prev: { schema?: string; table?: string }) => ({
        ...prev,
        schema,
      }),
    } as NavigateOptions)
  })

  useEffect(() => {
    if (defaultSchema && !search.schema) {
      handleAutoNavigate(defaultSchema)
    }
  }, [defaultSchema, search.schema])

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
      <div className="p-4">
        <Empty className="rounded-md border-solid border-destructive/20 bg-destructive/5 p-4 gap-2">
          <EmptyHeader className="gap-1">
            <EmptyTitle className="text-destructive text-sm">
              Error loading schema
            </EmptyTitle>
            <EmptyDescription className="text-destructive/80 text-xs">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 text-destructive border-destructive/20 hover:bg-destructive/10">
              Retry
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (!isFetching && (!schemas?.data || schemas.data.length === 0)) {
    return (
      <Empty className="border-0 rounded-none bg-card p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={DatabaseIcon} />
          </EmptyMedia>
          <EmptyTitle>No schemas found</EmptyTitle>
          <EmptyDescription>Create a schema to get started</EmptyDescription>
        </EmptyHeader>
        {!hideCreate && (
          <EmptyContent>
            <CreateSchemaSheet />
          </EmptyContent>
        )}
      </Empty>
    )
  }

  const handleSchemaChange = (value: string | null) => {
    navigate({
      search: (prev: { schema?: string; table?: string }) => ({
        ...prev,
        schema: value || defaultSchema,
        table: undefined,
      }),
    } as NavigateOptions)
  }

  const isProtected = isRestrictedSchema(currentSchema)

  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      <div className="flex gap-1">
        <Select
          onValueChange={handleSchemaChange}
          value={currentSchema}
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
      {isProtected && (
        <Empty className="rounded-md border-solid border-amber-500/20 bg-amber-500/10 p-4 gap-2">
          <EmptyHeader className="gap-1">
            <EmptyTitle className="text-amber-700 dark:text-amber-300 text-xs">
              Protected schema
            </EmptyTitle>
            <EmptyDescription className="text-amber-700/90 dark:text-amber-300/90 text-xs">
              Managed by Bunvel and is read-only.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
