import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.ts'
import { AuthContext, User } from './AuthContext'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    role: supabaseUser.role ?? 'user',
    metadata: supabaseUser.user_metadata
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const navigate = useNavigate()

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      if (error) throw error
      setUser(mapSupabaseUser(data.user))
    } catch (err) {
      setError(err as Error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(mapSupabaseUser(session?.user ?? null))
      } finally {
        setLoading(false)
      }
    }
    checkSession()
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