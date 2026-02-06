export interface QueryResult {
  data: Array<Record<string, any>>
  columns: Array<string>
  rowCount: number
  executionTime: number
}
