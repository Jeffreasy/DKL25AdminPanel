export const MAILGUN_API_KEY = import.meta.env.VITE_MAILGUN_API_KEY
export const MAILGUN_DOMAIN = 'dekoninklijkeloop.nl'

// Voeg validatie toe
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is not defined')
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined')
} 