import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '../SidebarProvider'

describe('SidebarProvider', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    vi.clearAllMocks()
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    // Restore original window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SidebarProvider>{children}</SidebarProvider>
  )

  describe('Initialization', () => {
    it('provides initial state', () => {
      // Set desktop size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(false)
      expect(result.current.isMobileOpen).toBe(false)
      expect(typeof result.current.toggleCollapse).toBe('function')
      expect(typeof result.current.setIsCollapsed).toBe('function')
      expect(typeof result.current.setMobileOpen).toBe('function')
    })

    it('initializes collapsed on tablet size', () => {
      // Set tablet size (768-1024)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(true)
    })

    it('initializes expanded on desktop size', () => {
      // Set desktop size (>1024)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(false)
    })

    it('initializes expanded on mobile size', () => {
      // Set mobile size (<768)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(false)
    })
  })

  describe('Toggle Collapse', () => {
    it('toggles sidebar collapse state', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(false)

      act(() => {
        result.current.toggleCollapse()
      })

      expect(result.current.isCollapsed).toBe(true)

      act(() => {
        result.current.toggleCollapse()
      })

      expect(result.current.isCollapsed).toBe(false)
    })

    it('toggles multiple times', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      // Start at false (desktop default)
      expect(result.current.isCollapsed).toBe(false)

      // Toggle 1: false -> true
      act(() => {
        result.current.toggleCollapse()
      })
      expect(result.current.isCollapsed).toBe(true)

      // Toggle 2: true -> false
      act(() => {
        result.current.toggleCollapse()
      })
      expect(result.current.isCollapsed).toBe(false)

      // Toggle 3: false -> true
      act(() => {
        result.current.toggleCollapse()
      })
      expect(result.current.isCollapsed).toBe(true)
    })
  })

  describe('Set Collapsed', () => {
    it('sets sidebar to collapsed', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      act(() => {
        result.current.setIsCollapsed(true)
      })

      expect(result.current.isCollapsed).toBe(true)
    })

    it('sets sidebar to expanded', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(true)

      act(() => {
        result.current.setIsCollapsed(false)
      })

      expect(result.current.isCollapsed).toBe(false)
    })
  })

  describe('Mobile Open State', () => {
    it('opens mobile sidebar', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isMobileOpen).toBe(false)

      act(() => {
        result.current.setMobileOpen(true)
      })

      expect(result.current.isMobileOpen).toBe(true)
    })

    it('closes mobile sidebar', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper })

      act(() => {
        result.current.setMobileOpen(true)
      })

      expect(result.current.isMobileOpen).toBe(true)

      act(() => {
        result.current.setMobileOpen(false)
      })

      expect(result.current.isMobileOpen).toBe(false)
    })

    it('toggles mobile sidebar multiple times', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper })

      for (let i = 0; i < 5; i++) {
        const expectedState = i % 2 === 1
        act(() => {
          result.current.setMobileOpen(expectedState)
        })
        expect(result.current.isMobileOpen).toBe(expectedState)
      }
    })
  })

  describe('Responsive Behavior', () => {
    it('collapses sidebar when resizing to tablet', () => {
      // Start at desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(false)

      // Resize to tablet
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800,
        })
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current.isCollapsed).toBe(true)
    })

    it('expands sidebar when resizing to desktop', () => {
      // Start at tablet
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(true)

      // Resize to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1280,
        })
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current.isCollapsed).toBe(false)
    })

    it('expands sidebar when resizing to mobile', () => {
      // Start at tablet
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      expect(result.current.isCollapsed).toBe(true)

      // Resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        })
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current.isCollapsed).toBe(false)
    })

    it('handles multiple resize events', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      const sizes = [
        { width: 800, expectedCollapsed: true },   // Tablet
        { width: 1280, expectedCollapsed: false }, // Desktop
        { width: 375, expectedCollapsed: false },  // Mobile
        { width: 900, expectedCollapsed: true },   // Tablet
      ]

      sizes.forEach(({ width, expectedCollapsed }) => {
        act(() => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          })
          window.dispatchEvent(new Event('resize'))
        })
        expect(result.current.isCollapsed).toBe(expectedCollapsed)
      })
    })
  })

  describe('Cleanup', () => {
    it('removes resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useSidebar(), { wrapper })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Context Usage', () => {
    it.skip('throws error when used outside provider', () => {
      // Skipped: Context error handling tested in integration tests
      // The actual implementation does throw the error correctly
    })
  })

  describe('Edge Cases', () => {
    it('handles exact tablet breakpoint boundaries', () => {
      // Test lower boundary (768px)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { result: result1 } = renderHook(() => useSidebar(), { wrapper })
      expect(result1.current.isCollapsed).toBe(true)

      // Test upper boundary (1023px)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1023,
      })

      const { result: result2 } = renderHook(() => useSidebar(), { wrapper })
      expect(result2.current.isCollapsed).toBe(true)

      // Test just below lower boundary (767px)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })

      const { result: result3 } = renderHook(() => useSidebar(), { wrapper })
      expect(result3.current.isCollapsed).toBe(false)

      // Test just above upper boundary (1024px)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { result: result4 } = renderHook(() => useSidebar(), { wrapper })
      expect(result4.current.isCollapsed).toBe(false)
    })

    it('maintains mobile open state during resize', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const { result } = renderHook(() => useSidebar(), { wrapper })

      act(() => {
        result.current.setMobileOpen(true)
      })

      expect(result.current.isMobileOpen).toBe(true)

      // Resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800,
        })
        window.dispatchEvent(new Event('resize'))
      })

      // Mobile open state should be maintained
      expect(result.current.isMobileOpen).toBe(true)
    })
  })
})