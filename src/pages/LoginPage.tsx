import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { sendPasswordResetEmail } from '../features/auth/resetPassword'
import { useNavigate } from 'react-router-dom'
import { H1, SmallText } from '../components/typography'
import { AlertMessage } from '../components/auth/AlertMessage'
import { LoadingSkeleton } from '../components/auth/LoadingSkeleton'
import { validateEmail } from '../utils/auth'

const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minuten

export function LoginPage() {
  const { user, loading: authLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLocked) {
      setError('Te veel inlogpogingen. Probeer het later opnieuw.')
      return
    }

    if (!validateEmail(email)) {
      setError('Voer een geldig e-mailadres in')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const normalizedEmail = email.toLowerCase().trim()
      const { error: signInError } = await signIn(normalizedEmail, password)
      
      if (signInError) {
        setIsLocked(true)
        setTimeout(() => {
          setIsLocked(false)
        }, LOCKOUT_TIME)
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <H1>DKL25 Admin</H1>
          <SmallText>Login om verder te gaan</SmallText>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="naam@voorbeeld.nl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Wachtwoord
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <AlertMessage type="error" message={error} />}
            {resetMessage && <AlertMessage type="success" message={resetMessage} />}

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                  text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Bezig met inloggen...
                  </div>
                ) : (
                  'Inloggen'
                )}
              </button>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 py-2"
              >
                {resetLoading ? 'Bezig met verzenden...' : 'Wachtwoord vergeten?'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 