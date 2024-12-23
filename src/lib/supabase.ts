import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper functie om te checken of iemand admin is
export const isAdmin = async () => {
  try {
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Auth check:', { user, userError })
    
    if (!user || userError) {
      console.log('No authenticated user found')
      return false
    }

    // 2. Check admin table
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    console.log('Admin check:', { 
      userId: user.id,
      adminResult: admin,
      error: adminError,
      query: `user_id = ${user.id}`
    })
    
    if (adminError) {
      console.error('Admin check failed:', adminError)
      return false
    }

    return !!admin
  } catch (err) {
    console.error('isAdmin check failed:', err)
    return false
  }
}

// Helper om de huidige user op te halen
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Voeg deze functie toe om de auth status te checken
export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Auth check error:', error)
    return false
  }
  return !!session
} 