export interface TableColumn {
  key: string
  header: string
  width?: string
  className?: string
}

export interface TableData {
  [key: string]: string | number | boolean | null
}

export interface SqlTemplate {
  id: string
  name: string
  description: string
  query: string
  icon: any
}

export interface TableListActionProps {
  schema: string
  table: string
}
