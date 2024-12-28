import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  logout: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setIsAuthenticated(false)
      setUser(null)
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
      throw err
    }
  }

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        console.log('Checking session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Session check result:', {
          hasSession: !!session,
          error: error?.message,
          user: session?.user
        })
        
        if (error) throw error
        
        setIsAuthenticated(!!session)
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Auth check failed:', err)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthenticated(!!session)
        setUser(session?.user ?? null)
        
        if (!session) {
          navigate('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 