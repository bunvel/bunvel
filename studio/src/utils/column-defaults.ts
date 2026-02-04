import type { ColumnDefinition } from '@/types/database'

export function getDefaultColumns(): ColumnDefinition[] {
  return [
    {
      name: 'id',
      type: 'bigint',
      nullable: false,
      isPrimaryKey: true,
      unique: false,
      defaultValue: undefined,
    },
    {
      name: 'created_at',
      type: 'timestamptz',
      nullable: false,
      isPrimaryKey: false,
      unique: false,
      defaultValue: 'now()',
    },
  ]
}

export function createEmptyColumn(): ColumnDefinition {
  return {
    name: '',
    type: 'text',
    nullable: true,
    isPrimaryKey: false,
    unique: false,
    defaultValue: undefined,
  }
}
