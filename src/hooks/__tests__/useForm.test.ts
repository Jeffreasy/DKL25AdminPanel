import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useForm } from '../useForm'

interface TestForm {
  email: string
  password: string
  age: number
}

describe('useForm', () => {
  const initialValues: TestForm = {
    email: '',
    password: '',
    age: 0,
  }

  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with provided values', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.isValid).toBe(true)
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('Field Changes', () => {
    it('updates field value on change', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.handleChange('email')('test@example.com')
      })

      expect(result.current.values.email).toBe('test@example.com')
      expect(result.current.isDirty).toBe(true)
    })

    it('clears error when field changes', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.email) errors.email = 'Required'
        return errors
      }

      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit, validate })
      )

      // Trigger validation
      act(() => {
        result.current.handleBlur('email')()
      })

      expect(result.current.errors.email).toBe('Required')

      // Change field
      act(() => {
        result.current.handleChange('email')('test@example.com')
      })

      expect(result.current.errors.email).toBeUndefined()
    })
  })

  describe('Field Blur', () => {
    it('marks field as touched on blur', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.handleBlur('email')()
      })

      expect(result.current.touched.email).toBe(true)
    })

    it('validates field on blur', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.email) errors.email = 'Email is required'
        return errors
      }

      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit, validate })
      )

      act(() => {
        result.current.handleBlur('email')()
      })

      expect(result.current.errors.email).toBe('Email is required')
    })
  })

  describe('Validation', () => {
    it('validates single field', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.email) errors.email = 'Required'
        if (values.age < 18) errors.age = 'Must be 18+'
        return errors
      }

      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit, validate })
      )

      act(() => {
        result.current.validateField('email')
      })

      expect(result.current.errors.email).toBe('Required')
      expect(result.current.errors.age).toBeUndefined()
    })

    it('validates entire form', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.email) errors.email = 'Required'
        if (!values.password) errors.password = 'Required'
        return errors
      }

      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit, validate })
      )

      let isValid: boolean = true
      act(() => {
        isValid = result.current.validateForm()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.email).toBe('Required')
      expect(result.current.errors.password).toBe('Required')
    })

    it('returns true when form is valid', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.email) errors.email = 'Required'
        return errors
      }

      const { result } = renderHook(() =>
        useForm({
          initialValues: { ...initialValues, email: 'test@example.com' },
          onSubmit: mockOnSubmit,
          validate,
        })
      )

      let isValid: boolean = false
      act(() => {
        isValid = result.current.validateForm()
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'test@example.com', password: 'pass', age: 25 },
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass',
        age: 25,
      })
    })

    it('prevents submission with invalid data', async () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.email) errors.email = 'Required'
        return errors
      }

      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit, validate })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
      expect(result.current.errors.email).toBe('Required')
    })

    it('marks all fields as touched on submit', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'test@example.com', password: 'pass', age: 25 },
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.touched.email).toBe(true)
      expect(result.current.touched.password).toBe(true)
      expect(result.current.touched.age).toBe(true)
    })

    it('sets isSubmitting during submission', async () => {
      let resolveSubmit: () => void
      const slowSubmit = vi.fn(
        () => new Promise<void>((resolve) => {
          resolveSubmit = resolve
        })
      )

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'test@example.com', password: 'pass', age: 25 },
          onSubmit: slowSubmit,
        })
      )

      // Start submission
      act(() => {
        result.current.handleSubmit()
      })

      // Wait for isSubmitting to be true
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true)
      })

      // Resolve the submission
      act(() => {
        resolveSubmit!()
      })

      // Wait for isSubmitting to be false
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    it('resets form after submission when resetOnSubmit is true', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          resetOnSubmit: true,
        })
      )

      act(() => {
        result.current.handleChange('email')('test@example.com')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      await waitFor(() => {
        expect(result.current.values).toEqual(initialValues)
        expect(result.current.isDirty).toBe(false)
      })
    })

    it('handles submission errors', async () => {
      const errorSubmit = vi.fn().mockRejectedValue(new Error('Submit failed'))

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'test@example.com', password: 'pass', age: 25 },
          onSubmit: errorSubmit,
        })
      )

      await expect(
        act(async () => {
          await result.current.handleSubmit()
        })
      ).rejects.toThrow('Submit failed')

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    it('prevents default form event', async () => {
      const mockEvent = {
        preventDefault: vi.fn(),
      } as any

      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'test@example.com', password: 'pass', age: 25 },
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      await waitFor(() => {
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })
  })

  describe('Programmatic Updates', () => {
    it('sets field value', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.setFieldValue('email', 'new@example.com')
      })

      expect(result.current.values.email).toBe('new@example.com')
    })

    it('sets field error', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.setFieldError('email', 'Custom error')
      })

      expect(result.current.errors.email).toBe('Custom error')
    })

    it('sets field touched', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.setFieldTouched('email', true)
      })

      expect(result.current.touched.email).toBe(true)
    })

    it('sets multiple values', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.setValues({
          email: 'test@example.com',
          password: 'newpass',
        })
      })

      expect(result.current.values.email).toBe('test@example.com')
      expect(result.current.values.password).toBe('newpass')
    })

    it('sets multiple errors', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.setErrors({
          email: 'Email error',
          password: 'Password error',
        })
      })

      expect(result.current.errors.email).toBe('Email error')
      expect(result.current.errors.password).toBe('Password error')
    })
  })

  describe('Form Reset', () => {
    it('resets form to initial values', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      act(() => {
        result.current.handleChange('email')('test@example.com')
        result.current.setFieldError('password', 'Error')
        result.current.setFieldTouched('email', true)
      })

      act(() => {
        result.current.resetForm()
      })

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe('Derived States', () => {
    it('tracks isDirty correctly', () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit })
      )

      expect(result.current.isDirty).toBe(false)

      act(() => {
        result.current.handleChange('email')('test@example.com')
      })

      expect(result.current.isDirty).toBe(true)

      act(() => {
        result.current.resetForm()
      })

      expect(result.current.isDirty).toBe(false)
    })

    it('tracks isValid correctly', () => {
      const validate = (values: TestForm) => {
        const errors: Partial<Record<keyof TestForm, string>> = {}
        if (!values.email) errors.email = 'Required'
        return errors
      }

      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: mockOnSubmit, validate })
      )

      expect(result.current.isValid).toBe(true)

      act(() => {
        result.current.validateForm()
      })

      expect(result.current.isValid).toBe(false)

      act(() => {
        result.current.handleChange('email')('test@example.com')
      })

      expect(result.current.isValid).toBe(true)
    })
  })
})