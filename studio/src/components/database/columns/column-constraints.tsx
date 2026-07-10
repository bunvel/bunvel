import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface ColumnConstraintsProps {
  column: {
    isPrimaryKey: boolean
    nullable: boolean
    unique: boolean
  }
  onChange: (field: string, value: boolean | undefined) => void
  disabled?: boolean
}

export function ColumnConstraints({
  column,
  onChange,
  disabled = false,
}: ColumnConstraintsProps) {
  return (
    <div className="space-y-4 w-full">
      <Field orientation="horizontal">
        <Switch
          id="is-primary-key"
          checked={column.isPrimaryKey}
          onCheckedChange={(checked) => onChange('isPrimaryKey', checked)}
          disabled={disabled}
        />
        <FieldContent>
          <FieldLabel htmlFor="is-primary-key">Is Primary Key</FieldLabel>
          <FieldDescription>
            A primary key indicates that a column or group of columns can be
            used as a unique identifier for rows in the table. Primary keys
            cannot be nullable.
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field orientation="horizontal">
        <Switch
          id="is-nullable"
          checked={column.nullable}
          onCheckedChange={(checked) => onChange('nullable', checked)}
          disabled={disabled || column.isPrimaryKey}
        />
        <FieldContent>
          <FieldLabel htmlFor="is-nullable">Allow Nullable</FieldLabel>
          <FieldDescription>
            {column.isPrimaryKey
              ? 'Primary keys cannot be nullable'
              : 'Allow the column to assume a NULL value if no value is provided'}
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field orientation="horizontal">
        <Switch
          id="is-unique"
          checked={column.unique}
          onCheckedChange={(checked) => onChange('unique', checked)}
          disabled={disabled}
        />
        <FieldContent>
          <FieldLabel htmlFor="is-unique">Is Unique</FieldLabel>
          <FieldDescription>
            Enforce values in the column to be unique across rows
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field>
        <div className="flex justify-between">
          <FieldLabel htmlFor="check-constraint">CHECK Constraint</FieldLabel>
          <FieldDescription>Optional</FieldDescription>
        </div>
        <Input
          id="check-constraint"
          name="checkConstraint"
          placeholder="Optional CHECK constraint"
          className="w-full"
          disabled={disabled}
        />
      </Field>
    </div>
  )
}
