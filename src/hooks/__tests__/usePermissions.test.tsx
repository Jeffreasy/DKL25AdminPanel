import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '../usePermissions'
import { AuthContext } from '@/features/auth/contexts/AuthContext'
import { ReactNode } from 'react'

const createWrapper = (user: any) => {
  return ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={{ user, loading: false, isLoading: false, isAuthenticated: !!user, error: null, login: vi.fn(), logout: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), refreshToken: vi.fn() }}>
      {children}
    </AuthContext.Provider>
  )
}

describe('usePermissions', () => {
  describe('hasPermission', () => {
    it('returns true when user has permission', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
          { resource: 'contact', action: 'write' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasPermission('contact', 'read')).toBe(true)
      expect(result.current.hasPermission('contact', 'write')).toBe(true)
    })

    it('returns false when user does not have permission', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasPermission('contact', 'write')).toBe(false)
      expect(result.current.hasPermission('user', 'read')).toBe(false)
    })

    it('returns false when user has no permissions', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasPermission('contact', 'read')).toBe(false)
    })

    it('returns false when user is null', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(null),
      })

      expect(result.current.hasPermission('contact', 'read')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true when user has at least one permission', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasAnyPermission('contact:read', 'contact:write')).toBe(true)
    })

    it('returns false when user has none of the permissions', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasAnyPermission('contact:write', 'user:read')).toBe(false)
    })

    it('handles empty permission list', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasAnyPermission('contact:read')).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('returns true when user has all permissions', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
          { resource: 'contact', action: 'write' },
          { resource: 'user', action: 'read' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasAllPermissions('contact:read', 'contact:write')).toBe(true)
    })

    it('returns false when user is missing one permission', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasAllPermissions('contact:read', 'contact:write')).toBe(false)
    })

    it('returns false when user has no permissions', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasAllPermissions('contact:read')).toBe(false)
    })
  })

  describe('permissions array', () => {
    it('returns formatted permissions array', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
          { resource: 'contact', action: 'write' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.permissions).toEqual(['contact:read', 'contact:write'])
    })

    it('returns empty array when no permissions', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.permissions).toEqual([])
    })

    it('returns empty array when user is null', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(null),
      })

      expect(result.current.permissions).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('handles permissions with special characters', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'admin_panel', action: 'full_access' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasPermission('admin_panel', 'full_access')).toBe(true)
    })

    it('is case sensitive', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      expect(result.current.hasPermission('Contact', 'read')).toBe(false)
      expect(result.current.hasPermission('contact', 'Read')).toBe(false)
    })

    it('handles duplicate permissions', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        permissions: [
          { resource: 'contact', action: 'read' },
          { resource: 'contact', action: 'read' },
        ],
      }

      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user),
      })

      // Set should deduplicate
      expect(result.current.permissions).toEqual(['contact:read'])
    })
  })
})