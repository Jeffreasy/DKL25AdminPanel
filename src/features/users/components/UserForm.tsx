import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { roleService } from '../services/roleService'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types'
import { cc } from '../../../styles/shared'

interface UserFormProps {
  initialValues?: User
  onSubmit: (values: CreateUserRequest | UpdateUserRequest) => Promise<void>
  isSubmitting: boolean
}

export function UserForm({ initialValues, onSubmit, isSubmitting }: UserFormProps) {
  const isEdit = !!initialValues
  const [email, setEmail] = useState(initialValues?.email || '')
  const [naam, setNaam] = useState(initialValues?.naam || '')
  const [rol, setRol] = useState(initialValues?.rol || 'user')
  const [password, setPassword] = useState('')
  const [isActief, setIsActief] = useState(initialValues?.is_actief ?? true)
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(initialValues?.newsletter_subscribed ?? false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Fetch available roles from backend
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles()
  })

  // Fallback roles if backend doesn't return any
  const roleOptions = roles.length > 0 
    ? roles.map(r => ({ value: r.name, label: r.name }))
    : [
        { value: 'admin', label: 'Admin' },
        { value: 'staff', label: 'Staff' },
        { value: 'user', label: 'User' },
        { value: 'Deelnemer', label: 'Deelnemer' },
        { value: 'Begeleider', label: 'Begeleider' },
        { value: 'Vrijwilliger', label: 'Vrijwilliger' }
      ];

  useEffect(() => {
    setEmail(initialValues?.email || '')
    setNaam(initialValues?.naam || '')
    setRol(initialValues?.rol || 'user')
    setPassword('')
    setIsActief(initialValues?.is_actief ?? true)
    setNewsletterSubscribed(initialValues?.newsletter_subscribed ?? false)
    setErrors({})
  }, [initialValues])

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Ongeldig emailadres'
    if (!naam.trim()) newErrors.naam = 'Naam is vereist'
    if (!rol) newErrors.rol = 'Rol is vereist'
    if (!isEdit && password.length < 6) newErrors.password = 'Wachtwoord moet minstens 6 karakters zijn'
    if (isEdit && password && password.length < 6) newErrors.password = 'Wachtwoord moet minstens 6 karakters zijn'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const values = { email, naam, rol, password, is_actief: isActief, newsletter_subscribed: newsletterSubscribed }
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className={cc.spacing.section.md}>
      {/* Email Field */}
      <div>
        <label className={cc.form.label()}>
          Email *
        </label>
        <input
          type="email"
          placeholder="gebruiker@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${cc.form.input()} ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
        />
        {errors.email && (
          <p className={cc.form.error()}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Name Field */}
      <div>
        <label className={cc.form.label()}>
          Naam *
        </label>
        <input
          type="text"
          placeholder="Volledige naam"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          className={`${cc.form.input()} ${errors.naam ? 'border-red-500 dark:border-red-500' : ''}`}
        />
        {errors.naam && (
          <p className={cc.form.error()}>
            {errors.naam}
          </p>
        )}
      </div>

      {/* Role Field */}
      <div>
        <label className={cc.form.label()}>
          Rol *
        </label>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className={`${cc.form.select()} ${errors.rol ? 'border-red-500 dark:border-red-500' : ''}`}
        >
          <option value="">Selecteer een rol</option>
          {roleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.rol && (
          <p className={cc.form.error()}>
            {errors.rol}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          De rol bepaalt welke permissies de gebruiker heeft
        </p>
      </div>

      {/* Password Field */}
      <div>
        <label className={cc.form.label()}>
          Wachtwoord {!isEdit && '*'}
        </label>
        <input
          type="password"
          placeholder={isEdit ? 'Laat leeg om niet te wijzigen' : 'Minstens 6 karakters'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${cc.form.input()} ${errors.password ? 'border-red-500 dark:border-red-500' : ''}`}
        />
        {errors.password && (
          <p className={cc.form.error()}>
            {errors.password}
          </p>
        )}
        {isEdit && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Laat dit veld leeg als je het wachtwoord niet wilt wijzigen
          </p>
        )}
      </div>

      {/* Toggles */}
      <div className={`${cc.spacing.section.sm} pt-4 border-t border-gray-200 dark:border-gray-700`}>
        <label className={`flex items-center ${cc.spacing.gap.md} cursor-pointer group`}>
          <div className="relative">
            <input
              type="checkbox"
              checked={isActief}
              onChange={(e) => setIsActief(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Account Actief</span>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Inactieve gebruikers kunnen niet inloggen
            </p>
          </div>
        </label>

        <label className={`flex items-center ${cc.spacing.gap.md} cursor-pointer group`}>
          <div className="relative">
            <input
              type="checkbox"
              checked={newsletterSubscribed}
              onChange={(e) => setNewsletterSubscribed(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Nieuwsbrief Abonnement</span>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Gebruiker ontvangt nieuwsbrieven
            </p>
          </div>
        </label>
      </div>

      {/* Form Actions */}
      <div className={`flex ${cc.spacing.gap.md} pt-4 border-t border-gray-200 dark:border-gray-700`}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cc.button.base({ color: 'primary', className: `flex-1 ${cc.spacing.gap.sm}` })}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Bezig...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEdit ? 'Bijwerken' : 'Aanmaken'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
