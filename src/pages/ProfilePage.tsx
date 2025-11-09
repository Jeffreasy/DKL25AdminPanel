import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from "../features/auth"
import { userClient } from '../api/client'
import { StepsTracker } from '../features/steps'
import { usePermissions } from '../hooks/usePermissions'
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
  const { hasPermission } = usePermissions()

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

  const onSubmit = async (_data: ProfileFormData) => {
    try {
      if (networkError) {
        setError('network_error')
        return
      }
      if (isLocked) {
        setError(`Te veel pogingen. Probeer het over ${lockoutTimeRemaining} seconden opnieuw.`)
        return
      }

      setResetAttempts(prev => prev + 1)
      setError(null)
      setSuccess(null)
      
      // Implement password change with modern userClient
      if (_data.newPassword && _data.newPassword.trim() !== '') {
        const result = await userClient.changePassword(_data.currentPassword, _data.newPassword)
        
        if (result.success) {
          setSuccess('Wachtwoord succesvol gewijzigd!')
          setResetAttempts(0)
          reset({ currentPassword: '', newPassword: '', confirmPassword: '', email: user?.email || '' })
        } else {
          if (result.error === 'Huidig wachtwoord is onjuist') {
            setError('Huidig wachtwoord is onjuist')
          } else {
            setError(result.error || 'Er ging iets mis bij het wijzigen van je wachtwoord')
          }
        }
      } else {
        // No password change, just show success
        setSuccess('Profiel gecontroleerd - geen wijzigingen')
        setResetAttempts(0)
        reset({ currentPassword: '', newPassword: '', confirmPassword: '', email: user?.email || '' })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Profile update error:', err)
      if (errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        setError('network_error')
      } else if (errorMessage.includes('wachtwoord') || errorMessage.includes('password')) {
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

      {/* Steps Tracking Section*/}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Stappen Tracking
        </h2>
        
        {/* Check if user is admin with steps:write permission */}
        {hasPermission('steps', 'write') ? (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Admin Stappen Beheer</h3>
                <p className="text-blue-100 dark:text-blue-200 mt-1">
                  Je hebt admin toegang tot het stappen systeem
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-white">Route Fondsen</h4>
                  </div>
                  <p className="text-sm text-blue-100 dark:text-blue-200 mb-3">
                    Beheer toegewezen fondsen per wandelroute
                  </p>
                  <Link
                    to="/steps-admin"
                    className={`inline-flex items-center ${cc.button.base({ color: 'secondary', size: 'sm' })} bg-white text-blue-700 hover:bg-blue-50 dark:bg-white/90 dark:text-blue-700 dark:hover:bg-white`}
                  >
                    Beheer Fondsen
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                   </svg>
                    <h4 className="text-lg font-semibold text-white">Deelnemer Stappen</h4>
                  </div>
                  <p className="text-sm text-blue-100 dark:text-blue-200 mb-3">
                    Bekijk en bewerk stappen van individuele deelnemers
                  </p>
                  <Link
                    to="/steps-admin"
                    className={`inline-flex items-center ${cc.button.base({ color: 'secondary', size: 'sm' })} bg-white text-blue-700 hover:bg-blue-50 dark:bg-white/90 dark:text-blue-700 dark:hover:bg-white`}
                  >
                    Beheer Stappen
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4 mt-4">
                <p className="text-sm text-white/80 text-center">
                  💡 Gebruik het volledige admin panel voor uitgebreide beheer mogelijkheden
                </p>
              </div>
            </div>
          </div>
        ) : (
          <StepsTracker />
        )}
      </div>
    </div>
  )
}