import type { ForeignKeyDefinition } from '@/types/database'
import { useState } from 'react'

export function useForeignKeyManagement() {
  const [foreignKeySheetOpen, setForeignKeySheetOpen] = useState(false)
  const [editingForeignKey, setEditingForeignKey] = useState<
    ForeignKeyDefinition | undefined
  >()

  const handleForeignKeySave = (
    foreignKey: ForeignKeyDefinition,
    setFormValues: (updater: (prev: any) => any) => void,
  ) => {
    if (editingForeignKey) {
      // Update existing foreign key
      setFormValues((prev) => ({
        ...prev,
        foreignKeys: prev.foreignKeys.map((fk: ForeignKeyDefinition) =>
          fk === editingForeignKey ? foreignKey : fk,
        ),
      }))
    } else {
      // Add new foreign key
      setFormValues((prev) => ({
        ...prev,
        foreignKeys: [...prev.foreignKeys, foreignKey],
      }))
    }
    setEditingForeignKey(undefined)
  }

  const handleEditForeignKey = (foreignKey: ForeignKeyDefinition) => {
    setEditingForeignKey(foreignKey)
    setForeignKeySheetOpen(true)
  }

  const handleAddForeignKey = () => {
    setEditingForeignKey(undefined)
    setForeignKeySheetOpen(true)
  }

  const handleRemoveForeignKey = (
    foreignKey: ForeignKeyDefinition,
    setFormValues: (updater: (prev: any) => any) => void,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      foreignKeys: prev.foreignKeys.filter(
        (fk: ForeignKeyDefinition) => fk !== foreignKey,
      ),
    }))
  }

  return {
    foreignKeySheetOpen,
    setForeignKeySheetOpen,
    editingForeignKey,
    handleForeignKeySave,
    handleEditForeignKey,
    handleAddForeignKey,
    handleRemoveForeignKey,
  }
}
