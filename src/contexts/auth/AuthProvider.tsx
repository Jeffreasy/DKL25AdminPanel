import { useState, useEffect } from 'react'
import { authManager } from '../../lib/auth'
import { jwtDecode } from 'jwt-decode'
import { AuthContext, User } from './AuthContext'
import type { User as BackendUser } from '../../features/users/types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await authManager.login(email, password)
      if (result.success && result.token) {
        const decoded: { sub: string } = jwtDecode(result.token)
        const id = decoded.sub
        const userData = await authManager.makeAuthenticatedRequest(`/api/users/${id}`) as BackendUser
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.rol,
          user_metadata: { full_name: userData.naam }
        })
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const signOut = async () => {
    try {
      await authManager.logout()
      setUser(null)
      // Navigation is handled by authManager.logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = authManager.isAuthenticated()
        if (isAuthenticated) {
          const token = authManager.getToken()
          if (token) {
            const decoded: { sub: string } = jwtDecode(token)
            const id = decoded.sub
            const userData = await authManager.makeAuthenticatedRequest(`/api/users/${id}`) as BackendUser
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.rol,
              user_metadata: { full_name: userData.naam }
            })
          }
        }
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      signIn, 
      signOut,
      logout: signOut,
      isAuthenticated: !!user,
      isLoading: loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
