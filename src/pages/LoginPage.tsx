import { useState } from 'react'
import { useAuth } from '../features/auth/AuthContext'

// Array met toegestane email adressen
const ALLOWED_EMAILS = [
  'jeffrey@dekoninklijkeloop.nl',
  'salih@dekoninklijkeloop.nl',
  'marieke@dekoninklijkeloop.nl'
]

// Array met toegestane domeinen
const ALLOWED_DOMAINS = [
  'jeffdash.com',
  'www.jeffdash.com',
  'dekoninklijkeloop.nl'
]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const isAllowedEmail = (email: string) => {
    const normalizedEmail = email.toLowerCase()
    
    // Check specifieke emails
    if (ALLOWED_EMAILS.includes(normalizedEmail)) {
      return true
    }

    // Check domeinen
    return ALLOWED_DOMAINS.some(domain => 
      normalizedEmail.endsWith(`@${domain}`)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check of het email adres is toegestaan
    if (!isAllowedEmail(email)) {
      setError('Dit email adres heeft geen toegang tot het admin panel.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await signIn(email)
      alert('Check je email voor de login link!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            DKL25 Admin
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Bezig...' : 'Login link versturen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 