import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Debounce hook - delays updating a value until after a specified delay
 * Useful for search inputs, API calls, and expensive operations
 */

export interface UseDebounceOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

/**
 * Debounce a value
 * Returns the debounced value that updates after the specified delay
 */
export function useDebounce<T>(
  value: T,
  delay: number = 500
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Debounce a callback function
 * Returns a debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  options: UseDebounceOptions = {}
): {
  debouncedCallback: T
  cancel: () => void
  flush: () => void
  isPending: () => boolean
} {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallTimeRef = useRef<number>(0)
  const lastInvokeTimeRef = useRef<number>(0)
  const argsRef = useRef<any[]>([])
  const [isPendingState, setIsPendingState] = useState(false)

  const invokeCallback = useCallback(() => {
    const args = argsRef.current
    lastInvokeTimeRef.current = Date.now()
    setIsPendingState(false)
    callback(...args)
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current)
      maxWaitTimeoutRef.current = null
    }
    setIsPendingState(false)
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      invokeCallback()
      cancel()
    }
  }, [invokeCallback, cancel])

  const isPending = useCallback(() => {
    return isPendingState
  }, [isPendingState])

  const debouncedCallback = useCallback((...args: any[]) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTimeRef.current
    const timeSinceLastInvoke = now - lastInvokeTimeRef.current

    lastCallTimeRef.current = now
    argsRef.current = args
    setIsPendingState(true)

    // Leading edge
    if (leading && timeSinceLastCall >= delay) {
      invokeCallback()
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set up maxWait timeout if specified
    if (maxWait !== undefined && !maxWaitTimeoutRef.current) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        invokeCallback()
        maxWaitTimeoutRef.current = null
      }, maxWait)
    }

    // Trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        invokeCallback()
        timeoutRef.current = null
        if (maxWaitTimeoutRef.current) {
          clearTimeout(maxWaitTimeoutRef.current)
          maxWaitTimeoutRef.current = null
        }
      }, delay)
    }
  }, [delay, leading, trailing, maxWait, invokeCallback]) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    debouncedCallback,
    cancel,
    flush,
    isPending
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * // 1. Debounce a value (e.g., search input)
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500)
 * 
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search with debounced value
 *       searchAPI(debouncedSearchTerm)
 *     }
 *   }, [debouncedSearchTerm])
 * 
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 * 
 * // 2. Debounce a callback function
 * function AutoSaveForm() {
 *   const { debouncedCallback: debouncedSave, cancel, flush } = useDebouncedCallback(
 *     async (formData) => {
 *       await saveToAPI(formData)
 *       console.log('Saved!')
 *     },
 *     1000
 *   )
 * 
 *   const handleChange = (field, value) => {
 *     setFormData(prev => ({ ...prev, [field]: value }))
 *     debouncedSave({ ...formData, [field]: value })
 *   }
 * 
 *   const handleSubmit = () => {
 *     flush() // Save immediately
 *   }
 * 
 *   const handleCancel = () => {
 *     cancel() // Cancel pending save
 *   }
 * 
 *   return (
 *     <form>
 *       <input onChange={(e) => handleChange('name', e.target.value)} />
 *       <button type="button" onClick={handleSubmit}>Submit</button>
 *       <button type="button" onClick={handleCancel}>Cancel</button>
 *     </form>
 *   )
 * }
 * 
 * // 3. With leading and trailing options
 * function RateLimitedButton() {
 *   const { debouncedCallback } = useDebouncedCallback(
 *     () => {
 *       console.log('Button clicked!')
 *       performAction()
 *     },
 *     1000,
 *     { leading: true, trailing: false } // Execute immediately, ignore subsequent calls
 *   )
 * 
 *   return (
 *     <button onClick={debouncedCallback}>
 *       Click me (rate limited)
 *     </button>
 *   )
 * }
 * 
 * // 4. With maxWait option
 * function ScrollHandler() {
 *   const { debouncedCallback } = useDebouncedCallback(
 *     () => {
 *       console.log('Scroll position:', window.scrollY)
 *     },
 *     500,
 *     { maxWait: 2000 } // Execute at least every 2 seconds
 *   )
 * 
 *   useEffect(() => {
 *     window.addEventListener('scroll', debouncedCallback)
 *     return () => window.removeEventListener('scroll', debouncedCallback)
 *   }, [debouncedCallback])
 * 
 *   return <div>Scroll to see debounced logs</div>
 * }
 * ```
 */