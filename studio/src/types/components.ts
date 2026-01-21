import { IconSvgElement } from '@hugeicons/react'

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
  category?: 'basic' | 'blog' | 'ecommerce' | 'analytics'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface TableListActionProps {
  schema: string
  table: string
}
