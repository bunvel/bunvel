import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ForeignKeyDefinition } from '@/types/database'
import { Edit, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface ForeignKeyCardProps {
  foreignKey: ForeignKeyDefinition
  schema: string
  columnName?: string
  onEdit: (foreignKey: ForeignKeyDefinition) => void
  onRemove: (foreignKey: ForeignKeyDefinition) => void
  disabled?: boolean
}

export function ForeignKeyCard({
  foreignKey,
  schema,
  columnName,
  onEdit,
  onRemove,
  disabled = false,
}: ForeignKeyCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Foreign key relation to: {schema}.{foreignKey.referencedTable}
            </p>
            <p className="text-sm text-muted-foreground">
              {columnName || foreignKey.column} → {schema}.
              {foreignKey.referencedTable}.{foreignKey.referencedColumn}
            </p>
            {(foreignKey.onDelete !== 'NO ACTION' ||
              foreignKey.onUpdate !== 'NO ACTION') && (
              <div className="flex gap-2 mt-2">
                {foreignKey.onDelete !== 'NO ACTION' && (
                  <Badge variant="secondary" className="text-xs">
                    ON DELETE: {foreignKey.onDelete}
                  </Badge>
                )}
                {foreignKey.onUpdate !== 'NO ACTION' && (
                  <Badge variant="secondary" className="text-xs">
                    ON UPDATE: {foreignKey.onUpdate}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(foreignKey)}
              disabled={disabled}
            >
              <HugeiconsIcon icon={Edit} className="h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onRemove(foreignKey)}
              disabled={disabled}
            >
              <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
