import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'

// Password strength types en utilities
type PasswordStrength = 'weak' | 'medium' | 'strong'

interface PasswordRequirement {
  text: string
  validator: (password: string) => boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { 
    text: 'Minimaal 8 karakters',
    validator: (p) => p.length >= 8 
  },
  { 
    text: 'Minimaal één hoofdletter',
    validator: (p) => /[A-Z]/.test(p) 
  },
  { 
    text: 'Minimaal één kleine letter',
    validator: (p) => /[a-z]/.test(p) 
  },
  { 
    text: 'Minimaal één cijfer',
    validator: (p) => /[0-9]/.test(p) 
  },
  { 
    text: 'Minimaal één speciaal karakter',
    validator: (p) => /[^A-Za-z0-9]/.test(p) 
  }
]

const getPasswordStrength = (password: string): PasswordStrength => {
  const meetsRequirements = PASSWORD_REQUIREMENTS.filter(req => 
    req.validator(password)
  ).length

  if (meetsRequirements <= 2) return 'weak'
  if (meetsRequirements <= 4) return 'medium'
  return 'strong'
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  medium: 'bg-yellow-500',
  strong: 'bg-green-500'
}

const strengthMessages: Record<PasswordStrength, string> = {
  weak: 'Zwak wachtwoord',
  medium: 'Redelijk wachtwoord',
  strong: 'Sterk wachtwoord'
}

// Update schema met complexe regels
const resetSchema = z.object({
  password: z.string()
    .min(8, 'Wachtwoord moet minimaal 8 karakters bevatten')
    .max(64, 'Wachtwoord mag maximaal 64 karakters bevatten')
    .regex(/[A-Z]/, 'Wachtwoord moet minimaal één hoofdletter bevatten')
    .regex(/[a-z]/, 'Wachtwoord moet minimaal één kleine letter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet minimaal één cijfer bevatten')
    .regex(/[^A-Za-z0-9]/, 'Wachtwoord moet minimaal één speciaal karakter bevatten'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
})

type ResetFormData = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resetAttempts, setResetAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(30)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [browserSupported, setBrowserSupported] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFocused, setIsFocused] = useState(false)

  // Refs
  const passwordRef = useRef<HTMLInputElement | null>(null)
  const lockTimeout = useRef<NodeJS.Timeout>()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema)
  })

  // Focus management met useCallback
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (passwordRef.current) {
      passwordRef.current.focus()
    }
  }, [])

  // Auto focus bij mount
  useEffect(() => {
    handleFocus()
  }, [handleFocus])

  // Fix ref combinatie
  const { ref: hookFormRef, ...rest } = register('password')
  
  const combinedRef = useCallback(
    (element: HTMLInputElement | null) => {
      // React Hook Form ref
      hookFormRef(element)
      
      // Onze eigen ref
      passwordRef.current = element
      
      // Auto focus bij mount als er nog geen focus is
      if (element && !isFocused) {
        handleFocus()
      }
    },
    [hookFormRef, isFocused, handleFocus]
  )

  // Password strength
  const password = watch('password')
  const passwordStrength = useMemo(() => 
    password ? getPasswordStrength(password) : null
  , [password])

  // Requirements check
  const requirementsMet = useMemo(() => 
    PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: password ? req.validator(password) : false
    }))
  , [password])

  // Rate limiting
  useEffect(() => {
    if (resetAttempts >= 5) {
      setIsLocked(true)
      lockTimeout.current = setTimeout(() => {
        setIsLocked(false)
        setResetAttempts(0)
      }, 30000) // 30 seconden lockout
    }
    return () => {
      if (lockTimeout.current) {
        clearTimeout(lockTimeout.current)
      }
    }
  }, [resetAttempts])

  // Countdown timer
  useEffect(() => {
    if (isLocked) {
      const interval = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 30
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isLocked])

  // Browser compatibility check
  useEffect(() => {
    const checkBrowserSupport = () => {
      const support = {
        localStorage: typeof window.localStorage !== 'undefined',
        webCrypto: typeof window.crypto !== 'undefined',
        modernBrowser: typeof window.Promise !== 'undefined' &&
          typeof window.fetch !== 'undefined' &&
          typeof window.Symbol !== 'undefined',
        secureContext: typeof window.isSecureContext !== 'undefined'
      }

      const isSupported = Object.values(support).every(Boolean)
      setBrowserSupported(isSupported)

      if (!isSupported) {
        console.warn('Browser compatibility issues:', 
          Object.entries(support)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature)
        )
      }
    }

    checkBrowserSupport()
  }, [])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setError('')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setError('Je bent offline. Controleer je internetverbinding.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Session cleanup
  useEffect(() => {
    return () => {
      // Cleanup bij unmount
      supabase.auth.refreshSession()
    }
  }, [])

  // Dark mode detection
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

  // Simuleer initiële loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Browser history handling
  useEffect(() => {
    const handlePopState = () => {
      if (window.confirm('Weet je zeker dat je deze pagina wilt verlaten? Je wijzigingen gaan verloren.')) {
        navigate('/login')
      } else {
        window.history.pushState(null, '', window.location.pathname)
      }
    }

    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [navigate])

  // Haal token uit URL hash
  const getAccessToken = () => {
    const hash = window.location.hash
    if (!hash) return null
    
    const params = new URLSearchParams(hash.replace('#', '?'))
    return params.get('access_token')
  }

  // Check token bij mount
  const accessToken = useMemo(() => getAccessToken(), [])

  // Update Supabase session met token
  useEffect(() => {
    if (accessToken) {
      // Set session met token
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: ''
      })
    }
  }, [accessToken])

  const onSubmit = async (data: ResetFormData) => {
    if (isLocked) {
      setError(`Te veel pogingen. Probeer het over ${lockoutTimeRemaining} seconden opnieuw.`)
      return
    }

    if (!isOnline) {
      setError('Je bent offline. Controleer je internetverbinding.')
      return
    }

    if (!browserSupported) {
      setError('Je browser wordt niet volledig ondersteund. Gebruik een recente versie van Chrome, Firefox, Safari of Edge.')
      return
    }

    try {
      setResetAttempts(prev => prev + 1)

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })

      if (updateError) {
        if (updateError.message.includes('expired')) {
          setError('De reset link is verlopen. Vraag een nieuwe aan.')
        } else if (updateError.message.includes('invalid')) {
          setError('Ongeldige reset link. Vraag een nieuwe aan.')
        } else {
          throw updateError
        }
        return
      }

      setSuccess(true)
      setResetAttempts(0)
      
      // Cleanup en redirect
      setTimeout(() => {
        supabase.auth.refreshSession()
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      console.error('Reset error:', err)
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase()
        if (message.includes('network') || message.includes('fetch')) {
          setError('Kan geen verbinding maken met de server. Controleer je internetverbinding.')
        } else if (message.includes('401') || message.includes('unauthorized')) {
          setError('Authenticatie fout. Vernieuw de pagina en probeer het opnieuw.')
        } else {
          setError('Er ging iets mis bij het resetten van je wachtwoord. Probeer het later opnieuw.')
        }
      }
    }
  }

  // Als er geen access_token is, toon een foutmelding
  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Ongeldige of verlopen reset link
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Deze link is niet meer geldig. Vraag een nieuwe reset link aan via de login pagina.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Terug naar login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
      isDarkMode ? 'dark' : ''
    }`}>
      {/* Breadcrumbs */}
      <nav className="max-w-md w-full mx-auto mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link to="/login" className="hover:text-gray-700 dark:hover:text-gray-200">
              Login
            </Link>
          </li>
          <li>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="text-gray-700 dark:text-gray-200">Wachtwoord resetten</li>
        </ol>
      </nav>

      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Wachtwoord resetten
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Wachtwoord succesvol gewijzigd
                </h3>
                <p className="text-sm text-green-700 mt-2">
                  Je wordt doorgestuurd naar de login pagina...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nieuw wachtwoord
                </label>
                <div className="mt-1 relative">
                  <input
                    ref={combinedRef}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...rest}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-describedby="password-requirements"
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

                {/* Password strength indicator */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${strengthColors[passwordStrength]}`}
                        style={{ 
                          width: passwordStrength === 'weak' ? '33%' : 
                                 passwordStrength === 'medium' ? '66%' : '100%' 
                        }}
                      />
                    </div>
                    <p className={`mt-1 text-sm ${
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {strengthMessages[passwordStrength]}
                    </p>
                  </div>
                )}

                {/* Password requirements */}
                <div className="mt-2 space-y-2" id="password-requirements">
                  {requirementsMet.map((req) => (
                    <div
                      key={req.text}
                      className={`flex items-center text-sm ${
                        req.met ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {req.met ? (
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        </svg>
                      )}
                      {req.text}
                    </div>
                  ))}
                </div>

                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Bevestig wachtwoord
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Bezig met opslaan...' : 'Wachtwoord wijzigen'}
              </button>
            </div>
          </form>
        )}

        {/* Cancel knop */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Weet je zeker dat je wilt annuleren? Je wijzigingen gaan verloren.')) {
                navigate('/login')
              }
            }}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  )
} 