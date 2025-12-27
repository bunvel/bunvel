import Endpoints from '@/data/endpoints'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
}

interface UseAuthUsersReturn {
  users: AuthUser[]
  isLoading: boolean
  error: string | null
  totalCount: number
  fetchUsers: (page: number, pageSize: number) => Promise<void>
}

export const useAuthUsers = (): UseAuthUsersReturn => {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)

  const fetchUsers = async (page: number = 1, pageSize: number = 100) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${Endpoints.GET_AUTH_USERS}?page=${page}&limit=${pageSize}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        )
      }
      
      const { data, totalCount } = await response.json()
      setUsers(data)
      setTotalCount(totalCount)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      toast.error(`Failed to fetch users: ${errorMessage}`)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers(1, 100)
  }, [])

  return {
    users,
    isLoading,
    error,
    totalCount,
    fetchUsers,
  }
}

export default useAuthUsers
