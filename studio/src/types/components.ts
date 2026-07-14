import type { IconSvgElement } from '@hugeicons/react'
import type { TableKind } from '@/types/database'

export interface TableColumn {
  key: string
  header: string
  width?: string
  className?: string
}

export interface TableData {
  [key: string]: unknown
}

export interface SqlTemplate {
  id: string
  name: string
  description: string
  query: string
  icon: IconSvgElement
}

export interface TableListActionProps {
  schema: string
  table: string
  kind?: TableKind
}
