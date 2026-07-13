import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { API_URL } from '@/constants/app'
import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

/**
 * Fetches the current session inside a proper server function context so that
 * `getRequestHeader` has access to the incoming request and can forward the
 * browser's session cookie to the backend.
 *
 * This cannot be done in `beforeLoad` directly because `beforeLoad` does not
 * run inside a server function context — `getRequestHeader` returns undefined
 * there, the cookie is never forwarded, and Better Auth returns null.
 */
export const fetchSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers: Record<string, string> = {}

    const cookie = getRequestHeader('cookie')
    if (cookie) headers.cookie = cookie

    const origin = getRequestHeader('origin')
    if (origin) headers.origin = origin

    const authorization = getRequestHeader('authorization')
    if (authorization) headers.authorization = authorization

    // Use the internal Docker hostname on the server so the request stays on
    // the internal network rather than going out through localhost.
    const serverAuthClient = createAuthClient({
      baseURL: API_URL,
      plugins: [adminClient()],
    })

    const { data: session } = await serverAuthClient.getSession({
      fetchOptions: { headers },
    })

    return session ?? null
  },
)
