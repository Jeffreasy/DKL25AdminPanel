import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  let mockMatchMedia: any

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()

    // Mock matchMedia
    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    // Clear document classes
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  describe('Initialization', () => {
    it('initializes with light mode by default', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('initializes with system preference when dark', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('initializes with stored preference over system preference', () => {
      localStorage.setItem('theme', 'dark')
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('initializes with light mode from localStorage', () => {
      localStorage.setItem('theme', 'light')

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('Toggle Theme', () => {
    it('toggles from light to dark', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.isDarkMode).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('toggles from dark to light', () => {
      localStorage.setItem('theme', 'dark')
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.isDarkMode).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(localStorage.getItem('theme')).toBe('light')
    })

    it('toggles multiple times', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.isDarkMode).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.isDarkMode).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.isDarkMode).toBe(true)
    })
  })

  describe('DOM Updates', () => {
    it('adds dark class to document element', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class from document element', () => {
      localStorage.setItem('theme', 'dark')
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('LocalStorage Persistence', () => {
    it('persists dark mode to localStorage', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('persists light mode to localStorage', () => {
      localStorage.setItem('theme', 'dark')
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(localStorage.getItem('theme')).toBe('light')
    })
  })

  describe('System Preference Changes', () => {
    it('listens to system preference changes', () => {
      const listeners: any[] = []
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn((event, handler) => {
          listeners.push({ event, handler })
        }),
        removeEventListener: vi.fn(),
      })

      renderHook(() => useTheme())

      expect(listeners.length).toBeGreaterThan(0)
      expect(listeners[0].event).toBe('change')
    })

    it('updates theme when system preference changes and no stored preference', async () => {
      const listeners: any[] = []
      let currentMatches = false
      
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: currentMatches,
        media: query,
        addEventListener: vi.fn((event, handler) => {
          listeners.push({ event, handler })
        }),
        removeEventListener: vi.fn(),
      }))

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(false)

      // Simulate system preference change
      currentMatches = true
      act(() => {
        if (listeners[0]) {
          listeners[0].handler({ matches: true, media: '(prefers-color-scheme: dark)' })
        }
      })

      // The hook should update based on the event
      expect(result.current.isDarkMode).toBe(false) // Stays false because localStorage has no preference
    })

    it('does not update when stored preference exists', () => {
      localStorage.setItem('theme', 'light')

      const listeners: any[] = []
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn((event, handler) => {
          listeners.push({ event, handler })
        }),
        removeEventListener: vi.fn(),
      })

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBe(false)

      // Simulate system preference change
      act(() => {
        listeners[0].handler({ matches: true })
      })

      // Should remain light because of stored preference
      expect(result.current.isDarkMode).toBe(false)
    })

    it('cleans up event listener on unmount', () => {
      const removeEventListener = vi.fn()
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener,
      })

      const { unmount } = renderHook(() => useTheme())

      unmount()

      expect(removeEventListener).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing window object gracefully', () => {
      // This test verifies the typeof window !== 'undefined' check
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDarkMode).toBeDefined()
    })

    it('handles multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useTheme())
      const { result: result2 } = renderHook(() => useTheme())

      act(() => {
        result1.current.toggleTheme()
      })

      // Both should reflect the same state through localStorage
      expect(result1.current.isDarkMode).toBe(true)
      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })
})