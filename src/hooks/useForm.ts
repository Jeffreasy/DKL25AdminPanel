import { useState, useCallback, FormEvent } from 'react'

/**
 * Generic form state management hook
 * Provides form state, validation, and submission handling
 */

export interface UseFormOptions<T> {
  initialValues: T
  onSubmit: (values: T) => Promise<void> | void
  validate?: (values: T) => Partial<Record<keyof T, string>>
  resetOnSubmit?: boolean
}

export interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  handleChange: (field: keyof T) => (value: any) => void
  handleBlur: (field: keyof T) => () => void
  handleSubmit: (e?: FormEvent) => Promise<void>
  setFieldValue: (field: keyof T, value: any) => void
  setFieldError: (field: keyof T, error: string) => void
  setFieldTouched: (field: keyof T, touched: boolean) => void
  setValues: (values: Partial<T>) => void
  setErrors: (errors: Partial<Record<keyof T, string>>) => void
  resetForm: () => void
  validateField: (field: keyof T) => void
  validateForm: () => boolean
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
  resetOnSubmit = false
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if form is dirty (values changed from initial)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)

  // Check if form is valid (no errors)
  const isValid = Object.keys(errors).length === 0

  // Validate a single field
  const validateField = useCallback((field: keyof T) => {
    if (!validate) return

    const fieldErrors = validate(values)
    if (fieldErrors[field]) {
      setErrorsState(prev => ({ ...prev, [field]: fieldErrors[field] }))
    } else {
      setErrorsState(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [values, validate])

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    if (!validate) return true

    const formErrors = validate(values)
    setErrorsState(formErrors)
    return Object.keys(formErrors).length === 0
  }, [values, validate])

  // Handle field change
  const handleChange = useCallback((field: keyof T) => (value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrorsState(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => () => {
    setTouchedState(prev => ({ ...prev, [field]: true }))
    validateField(field)
  }, [validateField])

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }))
  }, [])

  // Set field error programmatically
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field]: error }))
  }, [])

  // Set field touched programmatically
  const setFieldTouched = useCallback((field: keyof T, touched: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: touched }))
  }, [])

  // Set multiple values at once
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }))
  }, [])

  // Set multiple errors at once
  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(newErrors)
  }, [])

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValuesState(initialValues)
    setErrorsState({})
    setTouchedState({})
    setIsSubmitting(false)
  }, [initialValues])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Partial<Record<keyof T, boolean>>)
    setTouchedState(allTouched)

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
      if (resetOnSubmit) {
        resetForm()
      }
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm, onSubmit, resetOnSubmit, resetForm])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    resetForm,
    validateField,
    validateForm
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * interface LoginForm {
 *   email: string
 *   password: string
 * }
 * 
 * function LoginComponent() {
 *   const form = useForm<LoginForm>({
 *     initialValues: { email: '', password: '' },
 *     validate: (values) => {
 *       const errors: Partial<Record<keyof LoginForm, string>> = {}
 *       if (!values.email) errors.email = 'Email is required'
 *       if (!values.password) errors.password = 'Password is required'
 *       return errors
 *     },
 *     onSubmit: async (values) => {
 *       await login(values)
 *     }
 *   })
 * 
 *   return (
 *     <form onSubmit={form.handleSubmit}>
 *       <input
 *         value={form.values.email}
 *         onChange={(e) => form.handleChange('email')(e.target.value)}
 *         onBlur={form.handleBlur('email')}
 *       />
 *       {form.touched.email && form.errors.email && (
 *         <span>{form.errors.email}</span>
 *       )}
 *       <button type="submit" disabled={form.isSubmitting}>
 *         Submit
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */