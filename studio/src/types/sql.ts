export interface QueryResult {
  data: Record<string, any>[]
  columns: string[]
  rowCount: number
  executionTime: number
}
