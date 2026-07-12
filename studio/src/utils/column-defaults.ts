import type { ColumnDefinition } from '@/types/database'

export function getDefaultColumns(): Array<ColumnDefinition> {
  return [
    {
      name: 'id',
      type: 'UUID',
      nullable: false,
      isPrimaryKey: true,
      unique: false,
      defaultValue: undefined,
    },
    {
      name: 'created_at',
      type: 'TIMESTAMP WITH TIME ZONE',
      nullable: true,
      isPrimaryKey: false,
      unique: false,
      defaultValue: 'NOW()',
    },
  ]
}

export function createEmptyColumn(): ColumnDefinition {
  return {
    name: '',
    type: 'TEXT',
    nullable: true,
    isPrimaryKey: false,
    unique: false,
    defaultValue: undefined,
  }
}
