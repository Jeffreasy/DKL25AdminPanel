import { createClient } from '@supabase/supabase-js'

// Check en log de environment variables
// console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
// console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

// console.log('Env check:', {
//   url: import.meta.env.VITE_SUPABASE_URL,
//   hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
//   env: import.meta.env.MODE
// })

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables:', {
    url: import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  })
  throw new Error('Supabase configuration missing')
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// REMOVED: Old Supabase-based admin check
// Use RBAC system instead: src/hooks/usePermissions.ts -> isAdmin()

// Helper om de huidige user op te halen
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Voeg deze functie toe om de auth status te checken
export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    // console.error('Auth check error:', error)
    return false
  }
  return !!session
} 