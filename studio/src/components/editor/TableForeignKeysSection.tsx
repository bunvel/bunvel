import { Button } from '@/components/ui/button'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ForeignKeyDefinition } from '@/types/database'
import { TABLE_FORM_MESSAGES } from '@/constants/ui'
import { ForeignKeyCard } from './ForeignKeyCard'

interface TableForeignKeysSectionProps {
  foreignKeys: Array<ForeignKeyDefinition>
  schema: string
  tableName: string
  onAddForeignKey: () => void
  onEditForeignKey: (foreignKey: ForeignKeyDefinition) => void
  onRemoveForeignKey: (foreignKey: ForeignKeyDefinition) => void
  disabled?: boolean
}

export function TableForeignKeysSection({
  foreignKeys,
  schema,
  tableName,
  onAddForeignKey,
  onEditForeignKey,
  onRemoveForeignKey,
  disabled = false,
}: TableForeignKeysSectionProps) {
  return (
    <div className="space-y-4 p-6 border-t">
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          {TABLE_FORM_MESSAGES.FOREIGN_KEYS}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {TABLE_FORM_MESSAGES.DEFINE_FOREIGN_KEYS}
        </p>
      </div>

      {/* Foreign Key Cards */}
      <div className="space-y-3">
        {foreignKeys.map((fk, index) => (
          <ForeignKeyCard
            key={index}
            foreignKey={fk}
            schema={schema}
            onEdit={onEditForeignKey}
            onRemove={onRemoveForeignKey}
            disabled={disabled}
          />
        ))}

        {/* Add Foreign Key Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full mt-2"
          disabled={!tableName}
          onClick={onAddForeignKey}
        >
          <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
          {TABLE_FORM_MESSAGES.ADD_FOREIGN_KEY}
        </Button>
      </div>
    </div>
  )
}
