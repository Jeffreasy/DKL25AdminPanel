import { useState, useCallback } from 'react'
import type { LoginFormData } from '../types/auth'
import { emailRules, passwordRules, validateField } from '../utils/validation'

interface UseAuthForm {
  formData: LoginFormData
  errors: Record<string, string | null>
  isValid: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  validateForm: () => boolean
  resetForm: () => void
}

export function useAuthForm(initialData: LoginFormData = { email: '', password: '' }): UseAuthForm {
  const [formData, setFormData] = useState<LoginFormData>(initialData)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Valideer het veld tijdens typen
    const rules = name === 'email' ? emailRules : passwordRules
    const error = validateField(value, rules)
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors = {
      email: validateField(formData.email, emailRules),
      password: validateField(formData.password, passwordRules)
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== null)
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(initialData)
    setErrors({})
  }, [initialData])

  const isValid = !Object.values(errors).some(error => error !== null)

  return {
    formData,
    errors,
    isValid,
    handleChange,
    validateForm,
    resetForm
  }
} 