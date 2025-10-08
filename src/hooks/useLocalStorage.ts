import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'

/**
 * Local Storage hook - persists state in localStorage
 * Automatically syncs across tabs and handles serialization
 */

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
  initializeWithValue?: boolean
  syncData?: boolean
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    initializeWithValue = true,
    syncData = true
  } = options

  // Get initial value from localStorage or use provided initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? deserializer(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key, deserializer])

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (initializeWithValue) {
      return readValue()
    }
    return initialValue
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`)
      return
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value

      // Save to localStorage
      window.localStorage.setItem(key, serializer(newValue))

      // Save state
      setStoredValue(newValue)

      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new CustomEvent('local-storage', {
        detail: { key, newValue }
      }))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, serializer, storedValue])

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(`Tried removing localStorage key "${key}" even though environment is not a client`)
      return
    }

    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)

      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new CustomEvent('local-storage', {
        detail: { key, newValue: undefined }
      }))
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Sync state across tabs
  useEffect(() => {
    if (!syncData) return

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key && e.key !== key) {
        return
      }

      // Handle native storage event (from other tabs)
      if (e instanceof StorageEvent) {
        if (e.newValue === null) {
          setStoredValue(initialValue)
        } else {
          try {
            setStoredValue(deserializer(e.newValue))
          } catch (error) {
            console.warn(`Error deserializing localStorage key "${key}":`, error)
          }
        }
      }

      // Handle custom event (from same tab)
      if (e instanceof CustomEvent) {
        const detail = e.detail as { key: string; newValue: T | undefined }
        if (detail.key === key) {
          if (detail.newValue === undefined) {
            setStoredValue(initialValue)
          } else {
            setStoredValue(detail.newValue)
          }
        }
      }
    }

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for changes from same tab
    window.addEventListener('local-storage', handleStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange as EventListener)
    }
  }, [key, initialValue, deserializer, syncData])

  return [storedValue, setValue, removeValue]
}

/**
 * Example usage:
 * 
 * ```typescript
 * // 1. Basic usage with primitive values
 * function ThemeToggle() {
 *   const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light')
 * 
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *         Toggle Theme
 *       </button>
 *       <button onClick={removeTheme}>Reset Theme</button>
 *     </div>
 *   )
 * }
 * 
 * // 2. With complex objects
 * interface UserPreferences {
 *   language: string
 *   notifications: boolean
 *   fontSize: number
 * }
 * 
 * function UserSettings() {
 *   const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
 *     'user-preferences',
 *     {
 *       language: 'en',
 *       notifications: true,
 *       fontSize: 14
 *     }
 *   )
 * 
 *   const updateLanguage = (language: string) => {
 *     setPreferences(prev => ({ ...prev, language }))
 *   }
 * 
 *   return (
 *     <div>
 *       <select value={preferences.language} onChange={(e) => updateLanguage(e.target.value)}>
 *         <option value="en">English</option>
 *         <option value="nl">Nederlands</option>
 *       </select>
 *     </div>
 *   )
 * }
 * 
 * // 3. With custom serializer/deserializer
 * function DatePicker() {
 *   const [selectedDate, setSelectedDate] = useLocalStorage<Date>(
 *     'selected-date',
 *     new Date(),
 *     {
 *       serializer: (date) => date.toISOString(),
 *       deserializer: (str) => new Date(str)
 *     }
 *   )
 * 
 *   return (
 *     <input
 *       type="date"
 *       value={selectedDate.toISOString().split('T')[0]}
 *       onChange={(e) => setSelectedDate(new Date(e.target.value))}
 *     />
 *   )
 * }
 * 
 * // 4. Without cross-tab sync
 * function FormDraft() {
 *   const [draft, setDraft] = useLocalStorage(
 *     'form-draft',
 *     { title: '', content: '' },
 *     { syncData: false } // Don't sync across tabs
 *   )
 * 
 *   return (
 *     <form>
 *       <input
 *         value={draft.title}
 *         onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
 *       />
 *       <textarea
 *         value={draft.content}
 *         onChange={(e) => setDraft(prev => ({ ...prev, content: e.target.value }))}
 *       />
 *     </form>
 *   )
 * }
 * 
 * // 5. With function updater
 * function Counter() {
 *   const [count, setCount] = useLocalStorage('counter', 0)
 * 
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
 *       <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
 *     </div>
 *   )
 * }
 * ```
 */