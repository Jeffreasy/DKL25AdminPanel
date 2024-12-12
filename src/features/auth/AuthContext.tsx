import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase/supabaseClient'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const APP_URL = import.meta.env.VITE_APP_URL

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await supabase.auth.startAutoRefresh()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth session error:', error)
          await supabase.auth.refreshSession()
          setLoading(false)
          return
        }

        console.log('Session check:', session ? 'Active session' : 'No session')
        setUser(session?.user ?? null)
        
        if (!session?.user && location.pathname !== '/login' && location.pathname !== '/reset-password') {
          console.log('No session, redirecting to login')
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to login')
          navigate('/login', { replace: true })
        } else if (event === 'SIGNED_IN' && location.pathname === '/login') {
          console.log('User signed in, redirecting to dashboard')
          navigate('/', { replace: true })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      supabase.auth.stopAutoRefresh()
    }
  }, [navigate, location.pathname])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (!error) {
        console.log('Sign in successful, redirecting to:', `${APP_URL}/`)
        navigate('/')
      }

      return { error }
    } catch (err) {
      console.error('Sign in error:', err)
      return { error: err as AuthError }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 