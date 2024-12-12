import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { sendPasswordResetEmail } from '../features/auth/resetPassword'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { user, loading: authLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user && !authLoading) {
      console.log('User is authenticated, redirecting to dashboard')
      navigate('/', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Attempting login for:', email)
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        console.error('Login error:', signInError)
        throw signInError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Vul eerst je email adres in')
      return
    }

    setResetLoading(true)
    setError(null)
    setResetMessage(null)

    try {
      const { error } = await sendPasswordResetEmail(email)
      if (error) throw error
      setResetMessage('Check je email voor de wachtwoord reset link')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Login bij DKL25 Admin
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email adres"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Wachtwoord"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {resetMessage && (
            <div className="text-green-500 text-sm text-center">{resetMessage}</div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Bezig met inloggen...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              {resetLoading ? 'Bezig met verzenden...' : 'Wachtwoord vergeten?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 