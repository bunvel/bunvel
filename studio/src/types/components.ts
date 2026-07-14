import type { TableKind } from '@/types/database'
import type { IconSvgElement } from '@hugeicons/react'

export interface TableColumn {
  key: string
  header: string
  width?: string
  className?: string
}

export interface TableData {
  [key: string]: unknown
}

export interface QueryHistoryItem {
  id: string
  query: string
  timestamp: number
  success: boolean
}

export interface SqlTemplate {
  id: string
  name: string
  query: string
  icon: IconSvgElement
}

export interface TableListActionProps {
  schema: string
  table: string
  kind?: TableKind
}
