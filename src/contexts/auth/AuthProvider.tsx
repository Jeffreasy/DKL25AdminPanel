import { useState, useEffect } from 'react'
import { authManager } from '../../lib/auth'
import { AuthContext, User } from './AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await authManager.login(email, password)
      if (result.success && result.token) {
        // For now, create a basic user object. In a full implementation,
        // you'd decode the JWT to get user info
        setUser({
          id: 'admin',
          email: email,
          role: 'admin'
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
    const checkAuth = () => {
      try {
        const isAuthenticated = authManager.isAuthenticated()
        if (isAuthenticated) {
          // For now, create a basic user object. In a full implementation,
          // you'd decode the JWT to get user info
          setUser({
            id: 'admin',
            email: 'admin@dekoninklijkeloop.nl',
            role: 'admin'
          })
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