import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError, Session } from '@supabase/supabase-js'
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

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Als er een user is en we zijn op de login pagina, redirect naar dashboard
      if (session?.user && location.pathname === '/login') {
        navigate('/')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (!session?.user && location.pathname !== '/login' && location.pathname !== '/reset-password') {
          navigate('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate, location])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error) {
      navigate('/')
    }

    return { error }
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