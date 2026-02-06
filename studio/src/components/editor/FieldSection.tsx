import type { ColumnMetadata } from '@/types/table'
import { FieldRenderer } from './FieldRenderer'

interface FieldSectionProps {
  title: string
  columns: Array<ColumnMetadata>
  isOptional?: boolean
  formValues: Record<string, any>
  isSubmitting: boolean
  mode: 'insert' | 'edit'
  enumValuesMap: Record<string, Array<string>>
  onChange: (column: string, value: any) => void
  onReferenceSelectorOpen: (column: ColumnMetadata) => void
  hasPrimaryKey?: boolean
  hasRequired?: boolean
}

export function FieldSection({
  title,
  columns,
  isOptional = false,
  formValues,
  isSubmitting,
  mode,
  enumValuesMap,
  onChange,
  onReferenceSelectorOpen,
  hasPrimaryKey = false,
  hasRequired = false,
}: FieldSectionProps) {
  if (columns.length === 0) return null

  return (
    <>
      <div
        className={`${isOptional && (hasPrimaryKey || hasRequired) ? 'border-t pt-6' : ''}`}
      >
        <div className="space-y-2">
          <h3
            className={`text-sm font-medium ${isOptional ? 'text-muted-foreground' : 'text-foreground'}`}
          >
            {title}
          </h3>
          {isOptional && (
            <p className="text-xs text-muted-foreground">
              These are columns that do not need any value
            </p>
          )}
        </div>
      </div>
      <div className="space-y-6">
        {columns.map((column) => (
          <FieldRenderer
            key={column.column_name}
            column={column}
            value={formValues[column.column_name]}
            isSubmitting={isSubmitting}
            mode={mode}
            enumValuesMap={enumValuesMap}
            onChange={onChange}
            onReferenceSelectorOpen={onReferenceSelectorOpen}
          />
        ))}
      </div>
    </>
  )
}
