import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, mockAuthContext } from '@/test/utils'
import { render } from '@testing-library/react'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuth } from '@/features/auth'
import { usePermissions } from '@/hooks/usePermissions'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mock dependencies
vi.mock('@/features/auth')
vi.mock('@/hooks/usePermissions')

const renderProtectedRoute = (
  requiredPermission?: string,
  initialRoute = '/'
) => {
  // Use MemoryRouter directly without BrowserRouter wrapper
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute requiredPermission={requiredPermission}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/access-denied" element={<div>Access Denied</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading grid when loading', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isLoading: true,
        loading: true,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute()

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
    })

    it('does not navigate while loading', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isLoading: true,
        loading: true,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute()

      expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
    })
  })

  describe('Authentication', () => {
    it('renders children when authenticated without permission requirement', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute()

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('redirects to login when not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: false,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute()

      expect(screen.getByText('Login Page')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('Permission Checks', () => {
    it('renders children when user has required permission', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: ['contact:read'],
      })

      renderProtectedRoute('contact:read')

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('redirects to access-denied when user lacks permission', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute('contact:write')

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('calls hasPermission with correct arguments', () => {
      const mockHasPermission = vi.fn().mockReturnValue(true)
      
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: mockHasPermission,
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: ['contact:read'],
      })

      renderProtectedRoute('contact:read')

      expect(mockHasPermission).toHaveBeenCalledWith('contact', 'read')
    })

    it('handles permission string with multiple colons', () => {
      const mockHasPermission = vi.fn().mockReturnValue(true)
      
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: mockHasPermission,
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute('admin:panel:access')

      // split(':') splits on ALL colons, so 'admin:panel:access' becomes ['admin', 'panel', 'access']
      // The code uses [resource, action] = split(':'), so it takes first two elements
      expect(mockHasPermission).toHaveBeenCalledWith('admin', 'panel')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined requiredPermission', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute(undefined)

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('handles empty permission string', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute('')

      // Empty string is falsy, so no permission check is performed
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('handles permission without colon', () => {
      const mockHasPermission = vi.fn().mockReturnValue(true)
      
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: mockHasPermission,
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      renderProtectedRoute('admin')

      // Should handle gracefully
      expect(mockHasPermission).toHaveBeenCalled()
    })
  })

  describe('State Transitions', () => {
    it('handles loading to authenticated transition', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      // Start loading
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isLoading: true,
        loading: true,
      }))
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        permissions: [],
      })

      rerender(
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      // Transition to authenticated
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as any,
      }))

      rerender(
        <MemoryRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})