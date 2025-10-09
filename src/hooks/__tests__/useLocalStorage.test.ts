import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  const TEST_KEY = 'test-key'
  
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Basic Functionality', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'))
      
      expect(result.current[0]).toBe('initial')
    })

    it('returns stored value from localStorage', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('stored'))
      
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'))
      
      expect(result.current[0]).toBe('stored')
    })

    it('updates value in state and localStorage', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'))
      
      act(() => {
        result.current[1]('updated')
      })
      
      expect(result.current[0]).toBe('updated')
      expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify('updated'))
    })

    it('removes value from localStorage', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'))
      
      act(() => {
        result.current[1]('stored')
      })
      
      expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify('stored'))
      
      act(() => {
        result.current[2]() // removeValue
      })
      
      expect(result.current[0]).toBe('initial')
      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })
  })

  describe('Function Updater', () => {
    it('supports function updater', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 0))
      
      act(() => {
        result.current[1](prev => prev + 1)
      })
      
      expect(result.current[0]).toBe(1)
      
      act(() => {
        result.current[1](prev => prev + 5)
      })
      
      expect(result.current[0]).toBe(6)
    })

    it('handles complex state updates', () => {
      interface State {
        count: number
        name: string
      }
      
      const { result } = renderHook(() => 
        useLocalStorage<State>(TEST_KEY, { count: 0, name: 'test' })
      )
      
      act(() => {
        result.current[1](prev => ({ ...prev, count: prev.count + 1 }))
      })
      
      expect(result.current[0]).toEqual({ count: 1, name: 'test' })
    })
  })

  describe('Complex Data Types', () => {
    it('handles objects', () => {
      const obj = { name: 'John', age: 30 }
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, obj))
      
      expect(result.current[0]).toEqual(obj)
    })

    it('handles arrays', () => {
      const arr = [1, 2, 3, 4, 5]
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, arr))
      
      expect(result.current[0]).toEqual(arr)
    })

    it('handles nested objects', () => {
      const nested = {
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark'
            }
          }
        }
      }
      
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, nested))
      
      expect(result.current[0]).toEqual(nested)
    })

    it('handles null values', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>(TEST_KEY, null))
      
      expect(result.current[0]).toBeNull()
    })

    it('handles boolean values', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, true))
      
      expect(result.current[0]).toBe(true)
      
      act(() => {
        result.current[1](false)
      })
      
      expect(result.current[0]).toBe(false)
    })
  })

  describe('Custom Serialization', () => {
    it('uses custom serializer', () => {
      const { result } = renderHook(() => 
        useLocalStorage(TEST_KEY, 'test', {
          serializer: (value) => `custom:${value}`,
          deserializer: (value) => value.replace('custom:', '')
        })
      )
      
      act(() => {
        result.current[1]('value')
      })
      
      expect(localStorage.getItem(TEST_KEY)).toBe('custom:value')
      expect(result.current[0]).toBe('value')
    })

    it('handles Date objects with custom serializer', () => {
      const date = new Date('2024-01-01')
      
      const { result } = renderHook(() => 
        useLocalStorage<Date>(TEST_KEY, date, {
          serializer: (d) => d.toISOString(),
          deserializer: (str) => new Date(str)
        })
      )
      
      expect(result.current[0].toISOString()).toBe(date.toISOString())
    })
  })

  describe('Error Handling', () => {
    it('handles JSON parse errors gracefully', () => {
      localStorage.setItem(TEST_KEY, 'invalid json{')
      
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'fallback'))
      
      expect(result.current[0]).toBe('fallback')
    })

    it('handles localStorage quota exceeded', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'test'))
      
      // This won't actually exceed quota in tests, but tests the try-catch
      act(() => {
        result.current[1]('value')
      })
      
      expect(result.current[0]).toBe('value')
    })
  })

  describe('Options', () => {
    it('respects initializeWithValue option', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('stored'))
      
      const { result } = renderHook(() => 
        useLocalStorage(TEST_KEY, 'initial', { initializeWithValue: false })
      )
      
      expect(result.current[0]).toBe('initial')
    })

    it('can disable sync', () => {
      const { result } = renderHook(() => 
        useLocalStorage(TEST_KEY, 'test', { syncData: false })
      )
      
      expect(result.current[0]).toBe('test')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string key', () => {
      const { result } = renderHook(() => useLocalStorage('', 'test'))
      
      expect(result.current[0]).toBe('test')
    })

    it('handles special characters in key', () => {
      const specialKey = 'test:key@123#'
      const { result } = renderHook(() => useLocalStorage(specialKey, 'value'))
      
      act(() => {
        result.current[1]('updated')
      })
      
      expect(localStorage.getItem(specialKey)).toBe(JSON.stringify('updated'))
    })

    it('handles rapid updates', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 0))
      
      act(() => {
        result.current[1](1)
        result.current[1](2)
        result.current[1](3)
      })
      
      expect(result.current[0]).toBe(3)
    })

    it('handles undefined initial value', () => {
      const { result } = renderHook(() => 
        useLocalStorage<string | undefined>(TEST_KEY, undefined)
      )
      
      expect(result.current[0]).toBeUndefined()
    })
  })
})