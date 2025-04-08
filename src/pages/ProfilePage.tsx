import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from "../contexts/hooks/useAuth"
import { supabase } from '../lib/supabase'
import { 
  EyeIcon, 
  EyeSlashIcon,
  CheckIcon,
  XCircleIcon,
  HomeIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline'
import { 
  PASSWORD_REQUIREMENTS, 
  getPasswordStrength, 
  strengthColors, 
  strengthMessages 
} from '../utils/validation'
import DOMPurify from 'dompurify'
import { useTheme } from '../hooks/useTheme'

const profileSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
  currentPassword: z.string().min(1, 'Huidig wachtwoord is verplicht'),
  newPassword: z.string()
    .min(8, 'Wachtwoord moet minimaal 8 karakters bevatten')
    .max(64, 'Wachtwoord mag maximaal 64 karakters bevatten')
    .regex(/[A-Z]/, 'Wachtwoord moet minimaal één hoofdletter bevatten')
    .regex(/[a-z]/, 'Wachtwoord moet minimaal één kleine letter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet minimaal één cijfer bevatten')
    .regex(/[^A-Za-z0-9]/, 'Wachtwoord moet minimaal één speciaal karakter bevatten')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string()
}).refine(data => !data.newPassword || data.newPassword === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty: formIsDirty },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resetAttempts, setResetAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(30)

  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const lockTimeout = useRef<NodeJS.Timeout>()
  const formRef = useRef<HTMLFormElement>(null)

  const newPassword = watch('newPassword')
  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null
  const requirementsMet = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: newPassword ? req.validator(newPassword) : false
  }))

  const handleCancel = useCallback(() => {
    if (!isDirty || window.confirm('Weet je zeker dat je wilt annuleren?')) {
      navigate('/dashboard')
    }
  }, [isDirty, navigate])

  useEffect(() => {
    if (currentPasswordRef.current) {
      currentPasswordRef.current.focus()
    }
  }, [])

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

  useEffect(() => {
    const handleOnline = () => setNetworkError(false)
    const handleOffline = () => setNetworkError(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        setSessionExpired(true)
        setTimeout(() => {
          navigate('/login', { state: { from: 'profile', reason: 'session_expired' } })
        }, 3000)
      } else {
        // Reset timeout on valid session
        timeoutId = setTimeout(checkSession, 5 * 60 * 1000) // Check every 5 minutes
      }
    }

    checkSession()
    return () => clearTimeout(timeoutId)
  }, [navigate])

  const getErrorRecovery = (error: string) => {
    switch (error) {
      case 'network_error':
        return 'Controleer je internetverbinding en probeer het opnieuw.'
      case 'session_expired':
        return 'Je sessie is verlopen. Log opnieuw in om door te gaan.'
      case 'invalid_password':
        return 'Controleer je wachtwoord en probeer het opnieuw.'
      default:
        return 'Probeer het later opnieuw of neem contact op met support.'
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (networkError) {
        setError('network_error')
        return
      }

      if (sessionExpired) {
        setError('session_expired')
        return
      }

      if (isLocked) {
        setError(`Te veel pogingen. Probeer het over ${lockoutTimeRemaining} seconden opnieuw.`)
        return
      }

      setResetAttempts(prev => prev + 1)
      
      // Input sanitization
      const sanitizedData = {
        ...data,
        email: DOMPurify.sanitize(data.email),
        currentPassword: data.currentPassword, // Passwords don't need sanitization
        newPassword: data.newPassword,
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizedData.email,
        password: sanitizedData.currentPassword
      })

      if (signInError) {
        setError('Huidig wachtwoord is onjuist')
        return
      }

      // Update password if provided
      if (sanitizedData.newPassword) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: sanitizedData.newPassword
        })

        if (updateError) throw updateError
      }

      setSuccess('Profiel succesvol bijgewerkt')
      setResetAttempts(0)
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Profile update error:', err)
      
      if (errorMessage.includes('network')) {
        setError('network_error')
      } else if (errorMessage.includes('session')) {
        setError('session_expired')
      } else if (errorMessage.includes('password')) {
        setError('invalid_password')
      } else {
        setError('Er ging iets mis bij het bijwerken van je profiel')
      }
    }
  }

  useEffect(() => {
    setIsDirty(formIsDirty)
  }, [formIsDirty])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (window.confirm('Weet je zeker dat je wilt annuleren? Niet opgeslagen wijzigingen gaan verloren.')) {
          navigate('/dashboard')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  useEffect(() => {
    // Simuleer loading state voor betere UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isLocked) {
      setLockoutTimeRemaining(30)
      interval = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLocked])

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto transition-colors duration-200 ${
      isDarkMode ? 'dark' : ''
    }`}>
      {/* Breadcrumbs met dark mode */}
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link 
              to="/dashboard" 
              className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </li>
          <li>
            <ChevronRightIcon className="h-4 w-4" />
          </li>
          <li className="text-gray-900 dark:text-white">Profiel instellingen</li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg transform transition-all duration-300 hover:shadow-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="profile-heading">
            Profiel instellingen
          </h3>
          
          {success && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <p className="mt-1 text-sm text-red-600">
                  {getErrorRecovery(error)}
                </p>
              </div>
            </div>
          )}

          {/* Session expired warning */}
          {sessionExpired && (
            <div className="mt-4 rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">
                    Je sessie is verlopen. Je wordt doorgestuurd naar de login pagina...
                  </p>
                </div>
              </div>
            </div>
          )}

          <form 
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)} 
            className="mt-5 space-y-6 transform transition-all duration-300"
            aria-labelledby="profile-heading"
            role="form"
          >
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Email
              </label>
              <input
                type="email"
                id="email"
                disabled
                {...register('email')}
                aria-disabled="true"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 transition-all duration-200"
              />
            </div>

            <div className="space-y-4 transform transition-all duration-300">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  Huidig wachtwoord
                </label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    id="currentPassword"
                    {...register('currentPassword')}
                    ref={currentPasswordRef}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  Nieuw wachtwoord (optioneel)
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    {...register('newPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
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
                {newPassword && (
                  <div className="mt-2 space-y-2">
                    {requirementsMet.map((req) => (
                      <div
                        key={req.text}
                        className={`flex items-center text-sm ${
                          req.met ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {req.met ? (
                          <CheckIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-2" />
                        )}
                        {req.text}
                      </div>
                    ))}
                  </div>
                )}

                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  Bevestig nieuw wachtwoord
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 md:relative md:mt-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:p-0 md:border-0 transform transition-all duration-300 ease-in-out">
              <div className="flex justify-between max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 dark:bg-indigo-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? 'Bezig met opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Back link met dark mode */}
      <div className="mt-4 text-center">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
        >
          Terug naar dashboard
        </Link>
      </div>
    </div>
  )
} 