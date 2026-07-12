import { API_URL } from '@/constants/app'
import type { ApiError, ApiResponse } from '@/types/api'
import { logWideEvent } from './logger'

import { createIsomorphicFn } from '@tanstack/react-start'

export const getIsomorphicHeaders = createIsomorphicFn()
  .client(() => ({} as Record<string, string>))
  .server(async () => {
    try {
      const { getRequestHeader } = await import('@tanstack/react-start/server');
      const headers: Record<string, string> = {};
      const cookie = getRequestHeader('cookie');
      if (cookie) headers.cookie = cookie;
      const auth = getRequestHeader('authorization');
      if (auth) headers.authorization = auth;
      return headers;
    } catch {
      return {};
    }
  });

class ApiClient {
  constructor(private baseUrl: string = API_URL || '') {}

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    const ssrHeaders = await getIsomorphicHeaders();
    const headers = { ...defaultHeaders, ...ssrHeaders };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { ...headers, ...options.headers },
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

  get<T = any>(endpoint: string, params?: Record<string, any>, options?: RequestInit) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url, options)
  }

  post<T = any>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  put<T = any>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  delete<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'DELETE', ...options })
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
    logWideEvent('api.error', {
      message: apiError.message,
      status: apiError.status,
      code: apiError.code,
      details: apiError.details,
    })
    throw apiError
  }
  const unknownError = new Error('An unknown error occurred') as ApiError
  unknownError.code = 'UNKNOWN_ERROR'
  throw unknownError
}
