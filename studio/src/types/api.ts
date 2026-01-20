export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
}
