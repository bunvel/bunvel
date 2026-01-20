import type { ApiError, ApiResponse, HttpMethod } from '@/types'
import { API_URL } from '@/utils/constant'

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Headers

  constructor(baseUrl: string = API_URL || '') {
    this.baseUrl = baseUrl
    this.defaultHeaders = new Headers({
      'Content-Type': 'application/json',
    })
  }

  async request<T = any>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: any,
    customHeaders: HeadersInit = {},
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`
    const headers = new Headers(this.defaultHeaders)

    // Add custom headers
    const customHeadersObj = new Headers(customHeaders)
    customHeadersObj.forEach((value, key) => {
      headers.set(key, value)
    })

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    }

    if (data) {
      if (method === 'GET') {
        const params = new URLSearchParams()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
        const queryString = params.toString()
        if (queryString) {
          url = `${url}?${queryString}`
        }
      } else if (headers.get('content-type')?.includes('application/json')) {
        config.body = JSON.stringify(data)
      } else {
        config.body = data
      }
    }

    try {
      const response = await fetch(url, config)
      const responseData = await this.parseResponse(response)

      if (!response.ok) {
        throw this.createError(response, responseData)
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw this.enhanceError(error as ApiError)
      }
      throw this.enhanceError(new Error('An unknown error occurred'))
    }
  }

  get<T = any>(endpoint: string, params?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, 'GET', params, headers)
  }

  post<T = any>(endpoint: string, data?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, 'POST', data, headers)
  }

  put<T = any>(endpoint: string, data?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, 'PUT', data, headers)
  }

  delete<T = any>(endpoint: string, data?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, 'DELETE', data, headers)
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    return response.text()
  }

  private createError(response: Response, data: any): ApiError {
    const error: ApiError = new Error(data?.message || response.statusText)
    error.status = response.status
    error.code = data?.code
    error.details = data?.details
    return error
  }

  private enhanceError(error: ApiError): ApiError {
    console.error('API Error:', error.message, error)
    return error
  }
}

export const apiClient = new ApiClient()

export function handleApiError(error: unknown): never {
  if (error instanceof Error) {
    const apiError = error as ApiError
    console.error('API Error:', apiError.message, apiError)
    throw apiError
  }
  const unknownError = new Error('An unknown error occurred') as ApiError
  unknownError.code = 'UNKNOWN_ERROR'
  throw unknownError
}

export const createEndpoint = (path: string) => ({
  list: () => `${path}`,
  detail: (id: string | number) => `${path}/${id}`,
  action: (action: string) => `${path}/${action}`,
})
