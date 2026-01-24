export interface SqlTab {
  id: string
  title: string
  query: string
  isModified?: boolean
  result?: any
  error?: any
  isExecuting?: boolean
  lastExecutedQuery?: string
}
