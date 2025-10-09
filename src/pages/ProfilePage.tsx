import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from "../features/auth"
import { supabase } from '../api/client/supabase'
import {
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import {
  PASSWORD_REQUIREMENTS,
  getPasswordStrength,
  strengthColors,
  strengthMessages
} from '../utils/validation'
import DOMPurify from 'dompurify'
import { cc } from '../styles/shared'
import { ConfirmDialog, LoadingGrid } from '../components/ui'

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
  const [isLoading] = useState(false)
  const [resetAttempts, setResetAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(30)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const lockTimeout = useRef<NodeJS.Timeout>()
  const formRef = useRef<HTMLFormElement>(null)

  const newPassword = watch('newPassword')
  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null
  const requirementsMet = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: newPassword ? req.validator(newPassword) : false
  }))

  const handleCancelClick = useCallback(() => {
    if (isDirty) {
      setShowCancelConfirm(true)
    } else {
      navigate('/dashboard')
    }
  }, [isDirty, navigate])

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    navigate('/dashboard')
  }

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

  // Session check - alleen periodiek, niet bij mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        setSessionExpired(true)
        // Geef gebruiker tijd om te zien wat er gebeurt
        setTimeout(() => {
          navigate('/login', { state: { from: 'profile', reason: 'session_expired' } })
        }, 3000)
      }
    }

      checkSession()
      // Daarna elke 5 minuten
      const interval = setInterval(checkSession, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }, 5 * 60 * 1000)

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
      
      const sanitizedData = {
        ...data,
        email: DOMPurify.sanitize(data.email),
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizedData.email,
        password: sanitizedData.currentPassword
      })

      if (signInError) {
        setError('Huidig wachtwoord is onjuist')
        return
      }

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
        handleCancelClick()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCancelClick])

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
    return <LoadingGrid count={4} variant="compact" />
  }

  return (
    <div className="space-y-6">
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
              <HomeIcon className="w-4 h-4 mr-2.5" />
              Dashboard
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">Profiel</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Profiel Bijwerken
            </h3>
            
            {success && (
              <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800/50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-5 w-5 text-green-400 dark:text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800/50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{getErrorRecovery(error)}</p>
                  </div>
                </div>
              </div>
            )}
            {networkError && (
               <div className="mt-4 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 border border-yellow-200 dark:border-yellow-800/50">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Netwerkfout</p>
              </div>
            )}
             {sessionExpired && (
               <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800/50">
                 <p className="text-sm font-medium text-red-800 dark:text-red-200">Sessie verlopen</p>
               </div>
            )}

            <div className={`mt-6 ${cc.grid.formSix()}`}>
              <div className="sm:col-span-4">
                <label htmlFor="email" className={cc.form.label()}>Email</label>
                <input 
                  id="email" 
                  type="email" 
                  {...register('email')} 
                  className={cc.form.input()} 
                  readOnly
                  disabled 
                />
                {errors.email && <p className={cc.form.error()}>{errors.email.message}</p>}
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="currentPassword" className={cc.form.label()}>Huidig Wachtwoord</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...register('currentPassword')}
                    ref={currentPasswordRef}
                    className={cc.form.input({ className: "pr-10" })}
                    required
                    autoComplete="current-password"
                    disabled={isLocked || isSubmitting}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                 {errors.currentPassword ? (
                    <p className={cc.form.error()}>{errors.currentPassword.message}</p>
                 ) : error === 'Huidig wachtwoord is onjuist' ? (
                   <p className={cc.form.error()}>{error}</p>
                 ) : null}
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="newPassword" className={cc.form.label()}>Nieuw Wachtwoord (optioneel)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    className={cc.form.input({ className: "pr-10" })}
                    autoComplete="new-password"
                    disabled={isLocked || isSubmitting}
                  />
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                 {errors.newPassword && <p className={cc.form.error()}>{errors.newPassword.message}</p>}
              </div>

              {newPassword && (
                <div className="sm:col-span-4">
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs font-medium ${ passwordStrength === 'weak' ? 'text-red-700 dark:text-red-400' : passwordStrength === 'medium' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400' }`}>
                      {strengthMessages[passwordStrength!]}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className={`h-2 rounded-full ${strengthColors[passwordStrength!]} ${ passwordStrength === 'weak' ? 'w-1/3' : passwordStrength === 'medium' ? 'w-2/3' : 'w-full' }`}>
                    </div>
                  </div>
                  <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {requirementsMet.map(req => (
                      <li key={req.text} className="flex items-center">
                        {req.met ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                        )}
                        {req.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {newPassword && (
                <div className="sm:col-span-4">
                  <label htmlFor="confirmPassword" className={cc.form.label()}>Bevestig Nieuw Wachtwoord</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    className={cc.form.input()}
                    required={!!newPassword}
                    autoComplete="new-password"
                    disabled={isLocked || isSubmitting}
                  />
                  {errors.confirmPassword && <p className={cc.form.error()}>{errors.confirmPassword.message}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-right sm:px-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
               <button
                 type="button"
                 onClick={handleCancelClick}
                 className={cc.button.base({ color: 'secondary' })}
                 disabled={isSubmitting}
               >
                 Annuleren
               </button>
               <button 
                 type="submit" 
                 className={cc.button.base({ color: 'primary' })}
                 disabled={isSubmitting || isLocked || !formIsDirty}
               >
                 {isSubmitting ? 'Opslaan...' : 'Wijzigingen Opslaan'}
               </button>
             </div>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Wijzigingen annuleren"
        message="Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt annuleren?"
        confirmText="Ja, annuleren"
        cancelText="Nee, ga terug"
        variant="warning"
      />
    </div>
  )
}