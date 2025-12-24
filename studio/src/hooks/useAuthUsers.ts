import { QUERY_URL } from '@/lib/constant'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface AuthUser {
  id: string
  email: string | null
  phone: string | null
  email_confirmed: boolean
  phone_confirmed: boolean
  provider: string
  providers: Record<string, any>
  user_metadata: Record<string, any>
  app_metadata: Record<string, any>
  last_sign_in_at: string | null
  banned_until: string | null
  is_anonymous: boolean
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

  // In useAuthUsers.ts, update the fetchUsers function
  const fetchUsers = async (page: number = 1, pageSize: number = 10) => {
    setIsLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * pageSize
      
      // First, get the total count
      const countResponse = await fetch(QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'SELECT COUNT(*) as count FROM auth.users',
        }),
      })

      if (!countResponse.ok) {
        throw new Error(`Failed to fetch user count: ${countResponse.status} ${countResponse.statusText}`)
      }

      const countData = await countResponse.json()
      const total = countData[0]?.count || 0
      setTotalCount(total)

      // Then fetch the paginated users
      const usersResponse = await fetch(QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            SELECT 
              id,
              email,
              phone,
              email_confirmed,
              phone_confirmed,
              provider,
              providers,
              user_metadata,
              app_metadata,
              last_sign_in_at,
              banned_until,
              is_anonymous,
              created_at,
              updated_at
            FROM auth.users
            ORDER BY created_at DESC
            LIMIT ${pageSize} OFFSET ${offset}
          `,
        }),
      })

      if (!usersResponse.ok) {
        throw new Error(
          `Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`,
        )
      }

      const usersData = await usersResponse.json()

      // Process the users data
      const processedUsers = usersData.map((user: any) => ({
        ...user,
        providers: typeof user.providers === 'string' ? JSON.parse(user.providers) : user.providers || {},
        user_metadata: typeof user.user_metadata === 'string' ? JSON.parse(user.user_metadata) : user.user_metadata || {},
        app_metadata: typeof user.app_metadata === 'string' ? JSON.parse(user.app_metadata) : user.app_metadata || {},
      }))

      setUsers(processedUsers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers(1, 10)
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
