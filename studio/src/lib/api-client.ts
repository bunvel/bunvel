import { API_URL } from '@/constants/app'
import type { ApiError, ApiResponse } from '@/types/api'
import { logger } from './logger'

class ApiClient {
  constructor(private baseUrl: string = API_URL || '') {}

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
      ...options,
    })

    const data = await this.parseResponse(response)

    if (!response.ok) {
      throw this.createError(response, data)
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }
  }

  get<T = any>(endpoint: string, params?: Record<string, any>) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url)
  }

  post<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    return response.text()
  }

  private createError(response: Response, data: any): ApiError {
    const error: ApiError = new Error(
      data?.message || data?.error || response.statusText,
    )
    error.status = response.status
    error.code = data?.code || data?.error
    error.details = data?.details
    return error
  }
}

export const apiClient = new ApiClient()

export function handleApiError(error: unknown): never {
  if (error instanceof Error) {
    const apiError = error as ApiError
    logger.service('api-client').error('API Error', {
      message: apiError.message,
      status: apiError.status,
      code: apiError.code,
    })
    throw apiError
  }
  const unknownError = new Error('An unknown error occurred') as ApiError
  unknownError.code = 'UNKNOWN_ERROR'
  throw unknownError
}
